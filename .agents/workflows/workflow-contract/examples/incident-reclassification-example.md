# Incident Reclassification Example

An unknown login failure starts as `incident` in Investigation with a read-only safety boundary. Evidence shows the implementation violates already accepted authentication design, so the task records `Class: planned`, `Reclassified from: incident`, links the accepted design, and enters Execution. If evidence instead requires new API behavior, it reclassifies to `decision`, becomes `blocked`, and links a proposal.
