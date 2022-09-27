# Virtualization and Containers

[pcocc](https://github.com/cea-hpc/pcocc)

Virtualization:
- Implemented a virtual machine agent in Go
- Deployed a control TBON over GRPC

Containers:
- Integrated container support in an HPC orchestrator (POD and rootless)
- Developed custom OS images for fast booting VMs (for use as PODs)
- Implemented import and export of OCI container images
- Worked on MPI support inside containers
- Generation of lightweight Pod images with linuxkit