# Warehouse Manager

This project is a visual item location management system designed to help users keep track of physical items
within real-world spaces. Instead of relying on textual descriptions or spreadsheets, the system allows users
to visually recreate floor plans and furniture layouts and place items directly within these representations.

The application focuses on spatial accuracy and usability, enabling intuitive item placement, movement,
and real-time location lookup. By closely mirroring how items are organized and moved in real environments,
the system reduces cognitive load and makes it easier to locate and manage items over time. It is particularly
well suited for personal use, small organizations, and small-scale warehouses that require location-aware
inventory tracking without the complexity of enterprise inventory systems.

## Project Structure

### Root Directory

- `docker-compose.yaml`, `docker-compose.override.yaml`: Docker Compose configuration files for deploying the application.
- `img/`: Documentation images.
- `pgadmin-servers.json`: Pre-configured server connections for pgAdmin.

### Services (`services/`)

The backend is split into multiple Spring Boot services, each responsible for specific domain.

- `shapemanagement/`: Manages shape templates and shape instances in the system.
- `furnituremanagement/`: Handles furniture definitions, instances, and zones.
- `floormanagement/`: Manages floors and their layouts.
- `itemmanagement/`: Manages items.
- `gateway/`: Acts as a single entry point for the frontend and routes requests to the appropriate backend services.
- `servicediscovery/`: Implements service registration and discovery between backend services.

The frontend serving server is also hidden behind the gateway.

- `gui/`: Contains the frontend application code.

### Documentation Assets (`img/`)

Contains images editable with [draw.io](https://app.diagrams.net/) used in the documentation.

- `diagrams/`: Source files for diagrams in the documentation.
- `mockups/`: Source files for UI mockups in the documentation.
- `models/`: Source files for data model diagrams and services interaction diagrams.

## Hardware Requirements

These requirements assume deployment using the provided Docker Compose configuration.

- **CPU**:
  2 GHz dual-core 64-bit CPU
  Virtualization support must be enabled in BIOS.

- **Memory**:
  Minimum **16 GB RAM**
  More memory is recommended due to multiple running containers.

- **Disk Space**:
  At least **10 GB** of free storage
  Additional space may be required depending on stored user data.

- **Network**:
  Any network interface capable of running a web application.

## Software Requirements

- **Operating System**
  Windows, Linux, or macOS (any OS that supports Docker)

- **Docker**

  - Docker Engine
  - Docker Compose (V2)

- **Web Browser**
  Chrome or Firefox (recommended)
  Other modern browsers may work but are not officially supported.

## Deployment Steps

### 1. Navigate to the Project Root

Make sure you are in the top-level project directory containing the Docker Compose files:

```bash
cd Warehouse-Manager
```

### 2. Configure API URL

Update the API URL used by the frontend:

- File:
  `services/gui/src/config.js`
- Change the value of `API_URL` to the **public address or IP** of the machine running the application.

> If left as `localhost`, users accessing the application from another machine will not be able to save data.

### 3. Build Docker Images

Build all required Docker images:

```bash
docker compose build
```

This may take a while on the first run as base images and dependencies are downloaded.

### 4. Run the Application

Start all services:

```bash
docker compose up
```

On first startup, containers may take additional time to initialize.

### 5. Access the Application

Once all containers are running, the frontend can be accessed at:

```
http://localhost:8084
```

For external access, replace `localhost` with the machine’s IP address.

You should see the home page load without errors. It is recommended to open the browser developer console (F12) and verify that no errors are present.

## Running Services

After startup, the following containers should be running:

- item-management
- furniture-management
- floor-management
- shape-management
- item-database
- furniture-database
- floor-database
- shape-database
- gateway
- service-discovery
- user-interface

You can verify this with:

```bash
docker compose ps
```

## Troubleshooting

- **Docker daemon not running**
  Ensure Docker is installed and running.

- **`docker compose` not found**
  Make sure Docker Compose V2 is installed.

- **Port already in use**
  A port conflict exists. Update the affected ports in
  `docker-compose.override.yaml`.

- **Build errors**
  Check the terminal output during `docker compose build`.

- **Service startup errors**
  Inspect logs for a specific service:

  ```bash
  docker compose logs <service-name>
  ```

  Expected log messages:

  - Databases:

    ```
    database system is ready to accept connections
    ```

  - Management services:

    ```
    The response status is 200
    ```

  - Service discovery:

    ```
    Completed initialization
    ```

- **Out of memory or resource exhaustion**
  Ensure the system meets the minimum hardware requirements.
