# SnapShare Photo App Scaling Plan

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and view a feed containing photos from people they follow. The system must support photo uploads, feed requests, photo storage and thumbnail generation.

The following assumptions are used for the estimates:

* Registered users: 10 million.
* Daily active users: 10% of registered users.
* Each daily active user uploads one photo per day.
* Each daily active user views 50 feed pages per day.
* Average original photo size: 2 MB.
* Average thumbnail size: 50 KB.
* A day has 86,400 seconds, and a year has 365 days.
* For peak feed traffic, demand is estimated at five times the average rate.
* Every uploaded photo produces one thumbnail.
* Storage estimates exclude database records, backups, replication overhead and additional storage copies.
* The calculations assume a steady average workload; actual traffic may vary by time of day and season.

## 2. Traffic and Storage Calculations

### Daily active users

Daily active users are 10% of the 10 million registered users.

Daily active users = 10,000,000 × 10%

**Daily active users = 1,000,000 users**

### Photo uploads per second

Each active user uploads one photo per day.

Daily uploads = 1,000,000 × 1 = 1,000,000 uploads per day.

Average uploads per second = 1,000,000 ÷ 86,400

**Average upload rate ≈ 11.57 uploads per second.**

This is an average rate, not a guarantee that traffic will arrive evenly throughout the day.

### Feed views per second

Each active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50 = 50,000,000 feed views per day.

Average feed views per second = 50,000,000 ÷ 86,400

**Average feed rate ≈ 578.70 feed views per second.**

Peak feed rate = 578.70 × 5

**Estimated peak feed rate ≈ 2,894 feed views per second.**

The architecture should handle this estimated peak without depending on a single application server or database instance.

### Photo storage per year

Daily original-photo storage:

1,000,000 photos × 2 MB = 2,000,000 MB per day.

Daily thumbnail storage:

1,000,000 thumbnails × 50 KB = 50,000,000 KB per day.

Using decimal units (1 MB = 1,000 KB and 1 GB = 1,000 MB):

* Original photos: 2,000 GB per day, or approximately 2 TB per day.
* Thumbnails: 50 GB per day, or approximately 0.05 TB per day.
* Total: approximately 2.05 TB per day.

Annual original-photo storage:

2 TB × 365 = **730 TB per year**.

Annual thumbnail storage:

0.05 TB × 365 = **18.25 TB per year**.

Total annual photo-file storage:

730 TB + 18.25 TB = **748.25 TB per year**, or approximately 0.75 PB per year.

These figures represent new files generated during one year. If SnapShare retains all photos, the storage requirement will continue growing each year. Backups, replication and other copies will increase the actual capacity required.

## 3. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users generate approximately 50 million feed views per day, compared with one million photo uploads per day. Feed views are approximately 50 times more frequent than uploads.

This means the design should prioritize fast feed retrieval and efficient photo delivery. A cache can reduce repeated database queries, a read replica can serve read-only database queries, and a content delivery network (CDN) can deliver photo files closer to users. Uploads must still be reliable, but the system is expected to handle substantially more reads than writes.

## 4. Why Photo Files Should Not Be Stored in the Database

Original photos and thumbnails should be stored in object storage rather than directly inside the relational database. Photos are large binary files, and storing them in database rows would increase database size, backup time and storage costs while making database operations more resource-intensive.

The database should instead store metadata such as the photo ID, owner, caption, upload time and object-storage key. The actual image files can be stored in scalable object storage and delivered through a CDN. This separates metadata queries from file delivery and allows the two systems to scale independently.

## 5. Proposed Architecture Diagram

```text
                         USERS
                           |
             +-------------+-------------+
             |                           |
       Feed requests                Photo uploads
             |                           |
             v                           v
       +-------------+             +-------------+
       |     CDN     |             |    CDN /    |
       | Cached feed |             | Upload API  |
       | photos      |             | entry point |
       +-------------+             +-------------+
             |                           |
             | Cache miss / API request  |
             +-------------+-------------+
                           |
                           v
                   +---------------+
                   | Load Balancer |
                   +---------------+
                           |
              +------------+------------+
              |            |            |
              v            v            v
        +-----------+ +-----------+ +-----------+
        | App       | | App       | | App       |
        | Server 1  | | Server 2  | | Server N  |
        +-----------+ +-----------+ +-----------+
              |            |            |
              +------------+------------+
                           |
              +------------+-------------+
              |                          |
              v                          v
        +-------------+            +-------------+
        | Cache       |            | Primary DB  |
        | Feed /      |            | Users,      |
        | metadata    |            | follows,    |
        +-------------+            | photo data  |
                                   +-------------+
                                          |
                                          | Replication
                                          v
                                   +-------------+
                                   | Read Replica|
                                   +-------------+

 Photo upload and metadata flow:
 App Servers ---> Object Storage (original photo)
       |
       +---------> Queue ---> Thumbnail Worker
                                  |
                                  v
                           Object Storage
                           (thumbnail file)

 Object Storage ---> CDN ---> Users
```

The diagram separates application requests, metadata storage, image-file storage and asynchronous thumbnail processing. In a production implementation, upload requests would normally pass through the load balancer and application servers, while the CDN would deliver cached photos and forward cache misses to the appropriate origin.

## 6. Components and the Problems They Solve

* **CDN:** Delivers cached photos and thumbnails from locations closer to users, reducing latency and origin traffic.
* **Load balancer:** Distributes incoming application requests across multiple app servers to prevent one server from becoming a bottleneck.
* **App servers:** Authenticate users, validate uploads, create metadata records and assemble feed responses.
* **Cache:** Keeps frequently requested feed data and metadata available in memory to reduce repeated database queries.
* **Primary database:** Stores consistent application records such as users, follow relationships and photo metadata.
* **Read replica:** Handles eligible read-only database queries to reduce the primary database's read workload.
* **Object storage:** Stores original photos and thumbnails durably without filling the database with large binary files.
* **Queue:** Holds thumbnail-generation jobs so uploading a photo does not need to wait for image processing to finish.
* **Thumbnail worker:** Processes queued jobs to resize original photos into smaller thumbnails and stores the resulting files in object storage.

## 7. Step-by-Step Photo Upload Flow

1. A user selects a photo and submits it through the SnapShare application.
2. The request reaches the load balancer, which forwards it to a healthy application server.
3. The application server authenticates the user and validates the file type, file size and upload permissions.
4. The original photo is uploaded to object storage under a unique object key.
5. The application server saves the photo's metadata and object key in the primary database.
6. The application publishes a thumbnail-generation job to the queue, including the object key and required processing details.
7. The application confirms that the upload has been accepted without waiting for thumbnail processing to finish.
8. A thumbnail worker retrieves the job from the queue and reads the original photo from object storage.
9. The worker resizes the image to create a thumbnail and uploads the thumbnail to object storage.
10. The worker marks the job as completed or records a failure for retry and monitoring.
11. When another user views the photo, the application returns the relevant metadata and image URL, and the CDN delivers the original photo or thumbnail.
12. If a thumbnail is not yet available, the application can temporarily show a placeholder or the original image until processing completes.

The queue and worker should be designed to tolerate retries and duplicate job delivery. Unique object keys and idempotent processing help prevent repeated jobs from creating inconsistent results.

## 8. Design Trade-Offs

### Trade-off 1: Cache speed versus data freshness

Caching feed data reduces database load and improves response times, especially for popular photos. However, cached feeds can become outdated when a user uploads a photo or follows someone new. SnapShare must choose suitable cache-expiration periods and invalidate or refresh important entries when relevant data changes.

### Trade-off 2: Asynchronous processing versus immediate completeness

Using a queue for thumbnail generation allows uploads to finish quickly and protects application servers from heavy image-processing work. The trade-off is that thumbnails may not be ready immediately, and workers can fail or experience backlogs. Monitoring, retries, dead-letter handling and a placeholder image can improve reliability.

### Trade-off 3: Read replicas versus replication lag

A read replica can increase read capacity and reduce pressure on the primary database. However, replication may be delayed, so a user might briefly see stale metadata after an update. Queries that require the latest data should be directed to the primary database when appropriate.

### Trade-off 4: Object storage and CDN versus operational complexity

Object storage and a CDN can scale photo delivery efficiently and reduce load on app servers. However, they introduce additional configuration, access-control, caching and monitoring requirements. SnapShare must manage permissions carefully and ensure that private photos are not exposed through publicly accessible URLs.

## 9. Conclusion

SnapShare has an estimated one million daily active users, approximately 11.57 photo uploads per second, 578.70 average feed views per second and 2,894 peak feed views per second. New original photos and thumbnails require approximately 748.25 TB of storage per year before accounting for backups and replication.

Because feed reads greatly outnumber uploads, the design prioritizes read performance through a CDN, caching and a read replica. Object storage keeps large photo files separate from database metadata, while a queue and thumbnail worker allow image processing to happen asynchronously. Together, these components provide a scalable starting architecture that can be expanded as SnapShare grows.
