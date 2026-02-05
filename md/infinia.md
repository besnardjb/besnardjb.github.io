# Infinia

https://www.ddn.com/products/infinia/

Infinia is a large-scale multi-modal storage system designed for IA.
It provides multiple ways of manipulating and accessing the data at massive scale (Petabytes).

I have worked on several aspect of this system, particularly encompassing:
- Observability/Debuggability with a lot of Rust development
  - Prometheus, OpenTelemetry bridging of the C++ code
  - High frequency SDK for metric collection inside the code
- Networking and runtime working on client-side optimizations
  - Mostly C++ system programming for high-concurency clients
