# Incident Report --- Pizza Service Factory 500 Error

**Date of Incident:** December 2, 2025\
**Duration:** \~2 minutes 55 seconds (19:33:37 -- 19:36:32 UTC)\
**Local Time (Utah/MST):** 12:33 PM -- 12:36 PM\
**Reported by:** Trevor Wattles\
**Service:** JWT Pizza Service\
**Severity:** SEV-2 (Degraded service -- intermittent 500 errors on
order creation)

------------------------------------------------------------------------

## Summary

During routine traffic generation as part of the CS 329 Chaos
Engineering module, the JWT Pizza Service experienced a series of **HTTP
500 Internal Server Errors** originating from the downstream Pizza
Factory service. These failures were caused by an intentional chaos
injection event designed to test system resilience and observability.

Grafana Cloud monitoring detected elevated 500-level errors and
triggered the **HTTP 5xx Error Spike** alert. The issue resolved
automatically once the chaos event concluded, and normal order
processing resumed.

------------------------------------------------------------------------

## Impact

-   **Affected Endpoint:** `POST /api/order`

-   **Users Impacted:** Authenticated diners submitting orders during
    the incident window\

-   **Observed Symptoms:**

    -   HTTP 500 errors\
    -   Failed order submissions\

-   **Example error output:**

        "message": "Failed to fulfill order at factory"
        "error": "Factory request failed"
        "statusCode": 500

-   **Unaffected Service Areas:**

    -   Menu access\
    -   Authentication\
    -   Franchise operations

Only the order creation path exhibited failure.

------------------------------------------------------------------------

## Detection

The failure was detected through the existing alert rule in Grafana
Cloud.

**Alert Query:**

    sum(count_over_time({source="jwt-pizza-service"} |= "" | json | statusCode >= 500 [5m]))

**Trigger Condition:**\
Alert fires when the number of HTTP 500 responses exceeds 0 within the
defined time window.

Loki logs confirmed the spike in 500 errors beginning at **19:33:37
UTC**, aligning with the alert notification.

------------------------------------------------------------------------

## Timeline (UTC & MST)

  ------------------------------------------------------------------------
  Time (UTC)                  Local MST                 Event
  --------------------------- ------------------------- ------------------
  **19:33:37**                **12:33:37 PM**           First 500 error
                                                        logged --- factory
                                                        chaos begins

  19:33:38--19:36:32          12:33--12:36 PM           Continued 500s
                                                        from `/api/order`

  **19:36:32**                **12:36:32 PM**           Last recorded 500
                                                        error --- chaos
                                                        ends

  19:36--19:37                12:36--12:37 PM           Alert fired and
                                                        acknowledged

  \~19:38                     12:38 PM                  Support link
                                                        reviewed
                                                        indicating
                                                        incident
                                                        resolution

  19:39                       12:39 PM                  Successful order
                                                        creation confirmed
                                                        service recovery
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## Root Cause

### Immediate Cause

The Pizza Factory service generated deliberate failures as part of a
controlled chaos experiment:

    "message": "chaos monkey",
    "statusCode": 500

### Underlying Cause

These failures were expected within the context of the **CS 329 Chaos &
Observability assignment**. The JWT Pizza Service propagated the
upstream error correctly, demonstrating proper dependency handling.

------------------------------------------------------------------------

## Resolution

Error logs included a support URL from the Pizza Factory:

    https://pizza-factory.cs329.click/api/support/<incident-group>/report/<incident-id>

Accessing this link provided a status message confirming resolution:

    {"message": "Problem resolved. Pizza is back on the menu!"}

This validated that the chaos event had completed and the factory was
healthy again.\
A subsequent functional test of the order submission workflow returned
**HTTP 200 OK**, confirming that no intervention was required and the
system had fully recovered.

------------------------------------------------------------------------

## Lessons Learned

-   Monitoring and alerting operated as intended, correctly identifying
    upstream dependency failures.
-   Support links included in error logs provide immediate clarity
    regarding chaos events.
-   Validating service behavior after chaos termination is essential for
    confirming full recovery.
-   The system correctly surfaced downstream failures without incorrect
    internal behavior.

------------------------------------------------------------------------

## Action Items

### Immediate (Completed)

-   ✔ Reviewed support link confirming automated chaos resolution\
-   ✔ Verified system recovery via functional test\
-   ✔ Confirmed correct firing and clearing of 5xx alert

### Short-Term Improvements

-   [ ] Add dashboard visualization comparing successful vs failed
    orders\
-   [ ] Implement retry logic for transient downstream failures\
-   [ ] Add latency-focused alerts to capture slow dependency responses

### Long-Term Improvements

-   [ ] Implement circuit breaker pattern for external dependencies\
-   [ ] Improve end-user messaging during dependency outages\
-   [ ] Expand observability to include downstream factory health
    metrics

------------------------------------------------------------------------

This report reflects a professional summary of the incident, aligned
with expected behavior under controlled chaos conditions in the CS 329
coursework.
