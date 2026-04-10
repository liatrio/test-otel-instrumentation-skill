# OpenTelemetry Semantic Conventions Reference

This file is used by the `otel-instrumentation` skill when attributing spans. Always use the exact attribute key names listed here — do not invent or guess attribute names.

> Source: https://opentelemetry.io/docs/specs/semconv/ — verified April 2026

---

## General / Shared Attributes

These attributes appear across multiple signal types.

### Error Attributes

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `error.type` | string | Conditionally Required | Class of error when an operation fails (e.g., exception class name, HTTP status code string, `_OTHER` for unmapped errors) |

### Server & Client Attributes

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `server.address` | string | Recommended | Server domain name, IP, or socket name |
| `server.port` | int | Recommended | Server port number |
| `client.address` | string | Recommended | Client domain name, IP, or socket name |
| `client.port` | int | Recommended | Client port number |

### Network Attributes

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `network.protocol.name` | string | Recommended | OSI application layer protocol (e.g., `http`, `amqp`, `grpc`) |
| `network.protocol.version` | string | Recommended | Protocol version actually used (e.g., `1.1`, `2`, `3`) |
| `network.transport` | string | Recommended | OSI transport layer (`tcp`, `udp`, `quic`, `pipe`, `unix`) |
| `network.type` | string | Recommended | OSI network layer (`ipv4`, `ipv6`) |
| `network.peer.address` | string | Recommended | Peer IP address or socket name |
| `network.peer.port` | int | Recommended | Peer port number |
| `network.local.address` | string | Opt-In | Local socket address |
| `network.local.port` | int | Opt-In | Local socket port |

---

## HTTP Spans

> Source: https://opentelemetry.io/docs/specs/semconv/http/http-spans/

### Shared (Client + Server)

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `http.request.method` | string | Required | HTTP method per RFC9110 (`GET`, `POST`, `PUT`, etc.) |
| `http.response.status_code` | int | Conditionally Required | HTTP response status code |
| `error.type` | string | Conditionally Required | Error class when request fails |
| `http.request.method_original` | string | Conditionally Required | Original method if different from canonical (e.g., `SEARCH`) |
| `network.protocol.name` | string | Conditionally Required | `http` or `https` |
| `network.protocol.version` | string | Recommended | `1.1`, `2`, `3` |
| `user_agent.original` | string | Recommended | Value of `User-Agent` header |
| `http.request.body.size` | int | Opt-In | Request body size in bytes |
| `http.response.body.size` | int | Opt-In | Response body size in bytes |
| `http.request.header.<key>` | string[] | Opt-In | Normalized lowercase request header (e.g., `http.request.header.content-type`) |
| `http.response.header.<key>` | string[] | Opt-In | Normalized lowercase response header |

### HTTP Client Spans

Span name: `{method}` (e.g., `GET`, `POST`) — use route template if available

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `server.address` | string | Required | Server domain name or IP |
| `server.port` | int | Required | Server port |
| `url.full` | string | Required | Absolute URL (e.g., `https://api.example.com/users?page=1`) |
| `http.request.resend_count` | int | Recommended | Resend attempt number (starts at 1) |
| `url.template` | string | Opt-In | Low-cardinality path template (e.g., `/users/{id}`) |

### HTTP Server Spans

Span name: `{method} {route}` (e.g., `GET /users/{id}`) — never use literal URL paths

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `url.path` | string | Required | URI path component |
| `url.scheme` | string | Required | `http` or `https` |
| `http.route` | string | Conditionally Required | Matched route template (e.g., `/users/:id`) |
| `server.port` | int | Conditionally Required | Local server port |
| `url.query` | string | Conditionally Required | URI query string (if present) |
| `client.address` | string | Recommended | Client IP address |
| `server.address` | string | Recommended | Local server host name |

---

## Database Spans

> Source: https://opentelemetry.io/docs/specs/semconv/database/database-spans/

Span name: `{operation} {target}` — e.g., `SELECT users`, `CALL stored_proc`

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `db.system.name` | string | Required | DBMS product identifier (e.g., `postgresql`, `mysql`, `mongodb`, `redis`) |
| `db.collection.name` | string | Conditionally Required | Table or collection name |
| `db.namespace` | string | Conditionally Required | Database/schema name |
| `db.operation.name` | string | Conditionally Required | Operation being executed (`SELECT`, `INSERT`, `CALL`, etc.) |
| `db.response.status_code` | string | Conditionally Required | DBMS response/error code |
| `error.type` | string | Conditionally Required | Error class on failure |
| `server.port` | int | Conditionally Required | Database server port |
| `db.operation.batch.size` | int | Recommended | Number of queries in a batch |
| `db.query.summary` | string | Recommended | Low-cardinality query summary |
| `db.query.text` | string | Recommended | Full query text (sanitize sensitive values) |
| `db.stored_procedure.name` | string | Recommended | Stored procedure name |
| `network.peer.address` | string | Recommended | Database node address |
| `server.address` | string | Recommended | Database host name |
| `db.query.parameter.<key>` | string | Opt-In | Query parameter value |
| `db.response.returned_rows` | int | Opt-In | Number of rows returned |

**Common `db.system.name` values:** `postgresql`, `mysql`, `mssql`, `sqlite`, `oracle`, `mongodb`, `redis`, `cassandra`, `elasticsearch`, `dynamodb`

---

## Messaging Spans

> Source: https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/

Span name: `{operation} {destination}` — e.g., `publish orders`, `receive payments`

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `messaging.operation.name` | string | Required | Operation performed (`publish`, `receive`, `process`, etc.) |
| `messaging.system` | string | Required | Messaging system identifier (e.g., `kafka`, `rabbitmq`, `aws_sqs`, `gcp_pubsub`) |
| `error.type` | string | Conditionally Required | Error class on failure |
| `messaging.destination.name` | string | Conditionally Required | Topic, queue, or exchange name |
| `messaging.destination.template` | string | Conditionally Required | Low-cardinality destination template |
| `messaging.destination.temporary` | boolean | Conditionally Required | True if destination is ephemeral |
| `messaging.destination.anonymous` | boolean | Conditionally Required | True if destination is unnamed/auto-generated |
| `messaging.operation.type` | string | Conditionally Required | `send`, `receive`, or `process` |
| `messaging.consumer.group.name` | string | Conditionally Required | Consumer group name |
| `messaging.destination.subscription.name` | string | Conditionally Required | Subscription name |
| `messaging.batch.message_count` | int | Conditionally Required | Number of messages in a batch operation |
| `server.address` | string | Conditionally Required | Broker host |
| `messaging.client.id` | string | Recommended | Unique producer/consumer client ID |
| `messaging.destination.partition.id` | string | Recommended | Partition identifier |
| `messaging.message.id` | string | Recommended | Individual message identifier |
| `messaging.message.conversation_id` | string | Recommended | Conversation/correlation ID |
| `server.port` | int | Recommended | Broker port |
| `messaging.message.body.size` | int | Opt-In | Message body size in bytes |
| `messaging.message.envelope.size` | int | Opt-In | Total message size including headers |

---

## RPC Spans

> Source: https://opentelemetry.io/docs/specs/semconv/rpc/rpc-spans/

Span name: `{package}.{service}/{method}` — e.g., `com.example.UserService/GetUser`

### Common (Client + Server)

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `rpc.system.name` | string | Required | RPC system identifier (`grpc`, `jsonrpc`, `java_rmi`, `wcf`, `dotnet_wcf`, `apache_dubbo`) |
| `error.type` | string | Conditionally Required | Error class on failure |
| `rpc.method` | string | Conditionally Required | Fully-qualified method name |
| `rpc.method_original` | string | Conditionally Required | Original method name when different from `rpc.method` |
| `rpc.response.status_code` | string | Conditionally Required | Status code returned by server |
| `server.address` | string | Conditionally Required | Server host or group identifier |
| `server.port` | int | Conditionally Required | Server port |
| `network.peer.address` | string | Recommended | Peer IP address |
| `network.peer.port` | int | Recommended | Peer port |

### RPC Server Spans Only

| Attribute Key | Type | Requirement Level | Description |
|---|---|---|---|
| `client.address` | string | Recommended | Calling client address |
| `client.port` | int | Recommended | Calling client port |

**Common `rpc.system.name` values:** `grpc`, `jsonrpc`, `apache_dubbo`, `java_rmi`, `wcf`, `dotnet_wcf`

---

## Resource Attributes

These appear on the resource attached to all telemetry from a service, not on individual spans.

| Attribute Key | Type | Required | Description |
|---|---|---|---|
| `service.name` | string | **Critical** | Logical service name — must be identical across all instances of the same service |
| `service.version` | string | Recommended | Service version string |
| `service.instance.id` | string | Recommended | Unique ID for this instance (e.g., pod name, UUID) |
| `service.namespace` | string | Recommended | Logical grouping namespace |
| `deployment.environment.name` | string | Recommended | Deployment environment (`production`, `staging`, `development`) |
| `k8s.pod.name` | string | Recommended (K8s) | Kubernetes pod name |
| `k8s.pod.uid` | string | Recommended (K8s) | Kubernetes pod UID — enables telemetry correlation |
| `k8s.namespace.name` | string | Recommended (K8s) | Kubernetes namespace |
| `k8s.deployment.name` | string | Recommended (K8s) | Kubernetes deployment name |
| `telemetry.sdk.name` | string | Auto-populated | SDK name (e.g., `opentelemetry`) |
| `telemetry.sdk.language` | string | Auto-populated | SDK language (e.g., `go`, `python`) |
| `telemetry.sdk.version` | string | Auto-populated | SDK version string |
