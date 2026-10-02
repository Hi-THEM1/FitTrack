# FitTrack Database Setup Guide

This guide explains how to set up the MySQL database for the FitTrack application. The application requires MySQL 8.0+.

## Option 1: Local Development Setup

If you are running the database locally on your machine:

1. **Install MySQL Server:**
   Download and install [MySQL Community Server](https://dev.mysql.com/downloads/mysql/).

2. **Login to MySQL:**
   Open your terminal/command prompt and log in as root:
   ```bash
   mysql -u root -p
   ```

3. **Run the Schema Script:**
   From the MySQL shell, source the `schema.sql` file located in the `database` folder. Replace the path below with your actual absolute path:
   ```sql
   SOURCE C:/path/to/pfa-projet/database/schema.sql;
   ```

4. **Run the Seed Data Script:**
   After the schema is created, populate it with seed data:
   ```sql
   SOURCE C:/path/to/pfa-projet/database/insert_seed.sql;
   ```

5. **Verify the Installation:**
   ```sql
   USE fittrack_db;
   SHOW TABLES;
   SELECT * FROM exercises LIMIT 5;
   ```

## Option 2: Cloud Database Setup (PlanetScale / Aiven)

If you are using a cloud provider for production or shared development:

1. Create a new database named `fittrack_db` (or equivalent provided by your host).
2. Most cloud providers offer a Web Console or CLI to import SQL files.
3. Import `schema.sql` first.
4. Import `insert_seed.sql` second.
5. Obtain your Connection String URI. It should look something like:
   `mysql://username:password@host.region.provider.com/fittrack_db`

## Environment Variables

Once the database is running, you will need to add the connection details to your backend `.env` file (which will be created in Phase 2).

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fittrack_db
DB_PORT=3306
```

## Demo Account

The seed data script automatically creates an admin account for testing:
- **Email:** `demo@fittrack.com`
- **Password:** `password123`
