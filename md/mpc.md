# Multi−Processor Computing Runtime

http://mpc.hpcframework.com

Message Passing Interface (MPI):
- Integrated MPI-IO in the MPC MPI runtime
- Implemented Extended Generic Request support in MPC
- Re-implemented the datatype engine in MPC
- Implemented the full MPI 3.1 RDMA interface in MPC
- Shared-memory/Inter-Node collective optimization in MPC
- MPI-T profiling interface in MPC

Network programming:
 - Integrated IB RDMA support (one-sided) in MPC
 - Implemented Active-message RMDA in MPC
 - Implemented the multi-rail support in the MPC runtime

Compiler:
 - Privatization plugin for the MPC runtime (GCC)