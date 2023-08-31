# Publications

## [Generating and Scaling a Multi-Language Test-Suite for MPI](/pdf/pcvs23.pdf)

*Julien Adam, Jean-Baptiste Besnard, Paul Canat, Sameer Shende, Hugo Taboada, Adrien Roussel, Marc Pérache, Julien Jaeger*

High-Performance Computing (HPC) is currently facing significant challenges. The hardware pressure has become increasingly difficult to manage due to the lack of parallel abstractions in applications. As a result, parallel programs must undergo drastic evolution to effectively exploit underlying hardware parallelism. Failure to do so results in inefficient code. In this pressing environment, parallel runtimes play a critical role, and their testing becomes crucial. This paper focuses on the MPI interface and leverages the MPI binding tools to develop a multi-language test-suite for MPI. By doing so and building on previous work from the Forum’s document editors, we implement a systematic testing of MPI symbols in the context of the Parallel Computing Validation System (PCVS), which is an HPC validation platform dedicated to running and managing test-suites at scale. We first describe PCVS, then outline the process of generating the MPI API test suite, and finally, run these tests at scale. All data sets, code generators, and implementations are made available in open-source to the community. We also set up a dedicated website showcasing the results, which self-updates thanks to the Spack package manager.

## [Adaptive multi-tier intelligent data manager for Exascale](/pdf/admire.pdf)

*Jesús Carretero, Javier García-Blas, Marco Aldinucci, Jean-Baptiste Besnard, Jean-Thomas Acquaviva, André Brinkmann, Marc-André Vef, Emmanuel Jeannot, Alberto Miranda, Ramon Nou, Morris Riedel, Massimo Torquati, Felix Wolf*

The main objective of the ADMIRE project1 is the creation of an active I/O stack that dynamically adjusts computation and storage requirements through intelligent global coordination, the elasticity of computation and I/O, and the scheduling of storage resources along all levels of the storage hierarchy, while offering quality-of-service (QoS), energy efficiency, and resilience for accessing extremely large data sets in very heterogeneous computing and storage environments. We have developed a framework prototype that is able to dynamically adjust computation and storage requirements through intelligent global coordination, separated control, and data paths, the malleability of computation and I/O, the scheduling of storage resources along all levels of the storage hierarchy, and scalable monitoring techniques. The leading idea in ADMIRE is to co-design applications with ad-hoc storage systems that can be deployed with the application and adapt their computing and I/O behaviour on runtime, using malleability techniques, to increase the performance of applications and the throughput of the applications.

## [Towards Achieving Transparent Malleability Thanks to MPI Process Virtualization](/pdf/transparent.pdf)

*Hugo Taboada, Romain Pereira, Julien Jaeger, Jean-Baptiste Besnard*

International Conference on High Performance Computing (ISC 23) -- HPCMALL

The field of High-Performance Computing is rapidly evolving, driven by the race for computing power and the emergence of new architectures. Despite these changes, the process of launching programs has remained largely unchanged, even with the rise of hybridization and accelerators. However, there is a need to express more complex deployments for parallel applications to enable more efficient use of these machines. In this paper, we propose a transparent way to express malleability within MPI applications. This process relies on MPI process virtualization, facilitated by a dedicated privatizing compiler and a user-level scheduler. With this framework, using the MPC thread-based MPI context, we demonstrate how code can mold its resources without any software changes, opening the door to transparent MPI malleability. After detailing the implementation and associated interface, we present performance results on representative applications.

## [Towards Smarter Schedulers: Molding Jobs into the Right Shape via Monitoring and Modeling](/pdf/smarter.pdf)

*Jean-Baptiste Besnard, Ahmad Tarraf, Clément Barthélemy, Alberto Cascajo, Emmanuel Jeannot, Sameer Shende, Felix Wolf*

International Conference on High Performance Computing (ISC 23) -- HPCMALL

High-performance computing is not only a race towards the
fastest supercomputers but also the science of using such massive machines productively to acquire valuable results – outlining the importance of performance modelling and optimization. However, it appears that more than punctual optimization is required for current architectures, with users having to choose between multiple intertwined parallelism possibilities, dedicated accelerators, and I/O solutions. Witnessing this challenging context, our paper establishes an automatic feedback loop between how applications run and how they are launched, with a specific focus on I/O. One goal is to optimize how applications are launched through moldability (launch-time malleability). As a first step in this direction, we propose a new, always-on measurement infrastructure based on state-of-the-art cloud technologies adapted for HPC. In this paper, we present the measurement infrastructure and associated design choices. Moreover, we leverage an existing performance modelling tool to generate I/O performance models. We outline sample modelling capabilities, as derived from our measurement chain showing the critical importance of the measurement in future HPC systems, especially concerning resource configurations. Thanks to this precise performance model infrastructure, we can improve moldability and malleability on HPC systems.

## [MPI Application Binary Interface Standardization](/pdf/abi.pdf)

*Jeff R. Hammond, Lisandro Dalcin, Erik Schnetter, Marc Pérache, Jean-Baptiste Besnard, Jed Brown, Gonzalo Brito Gadeschi, Joseph Schuchart, Simon Byrne, Hui Zhou*

EuroMPI 2023

MPI is the most widely used interface for high-performance computing (HPC) workloads. Its success lies in its embrace of libraries and ability to evolve while maintaining backward compatibility for older codes, enabling them to run on new architectures for many years. In this paper, we propose a new level of MPI compatibility: a standard Application Binary Interface (ABI). We review the history of MPI implementation ABIs, identify the constraints from the MPI standard and ISO C, and summarize recent efforts to develop a standard ABI for MPI. We provide the current proposal from the MPI Forum's ABI working group, which has been prototyped both within MPICH and as an independent abstraction layer called Mukautuva. We also list several use cases that would benefit from the definition of an ABI while outlining the remaining constraints.


## [Enabling Global MPI Process Addressing in MPI Applications](/pdf/euro22.pdf)

*Jean-Baptiste Besnard, Allen D. Malony, Sameer Shende,  Julien Jaeger, Marc Pérache*

EuroMPI 2022: 27-


Distributed software using MPI is now facing a complexity barrier. Indeed, given increasing intra-node parallelism, combined with the use of accelerator, programs’ states are becoming more intricate. A given code must cover several cases, generating work for multiple devices. Model mixing generally leads to increasingly large pro- grams and hinders performance portability. In this paper, we pose the question of software composition, trying to split jobs in multiple services. In doing so, we advocate it would be possible to depend on more suitable units while removing the need for extensive runtime stacking (MPI+X+Y). For this purpose, we discuss what MPI shall provide and what is currently available to enable such software com- position. After pinpointing (1) process discovery and (2) Remote Procedure Calls (RPCs) as facilitators in such infrastructure, we focus solely on the first aspect. We introduce an overlay-network providing whole-machine inter-job, discovery, and wiring at the level of the MPI runtime. MPI process Unique IDentifiers (UIDs) are then covered as a Unique Resource Locator (URL) leveraged as support for job interaction in MPI, enabling a more horizontal usage of the MPI interface. Eventually, we present performance results for large-scale wiring-up exchanges, demonstrating gains over PMIx in cross-job configurations.

## [Exploring space‑time trade‑off in backtraces](/pdf/backtrace.pdf)

*Jean‑Baptiste Besnard, Julien Adam, Allen D Malony, Sameer Shende, Julien Jaeger, Patrick Carribault, and Marc Pérache.*

In Tools for High Performance Computing 2018/2019, pages 151–168. Springer, 2021.


The backtrace is one of the most common operations done by profiling and debugging tools. It consists in determining the nesting of functions leading to the current execution state. Frameworks and standard libraries provide facilities enabling this operation, however, it generally incurs both computational and memory costs. Indeed, walking the stack up and then possibly resolving functions pointers (to function names) before storing them can lead to non-negligible costs. In this paper, we propose to explore a means of extracting optimized backtraces with an O(1) storage size by defining the notion of stack tags. We define a new data-structure that we called a hashed-trie used to encode stack traces at runtime through chained hashing. Our process called stack-tagging is implemented in a GCC plugin, enabling its use of C and C++ application. A library enabling the decoding of stack locators though both static and brute-force analysis is also presented. This work introduces a new manner of capturing execution state which greatly simplifies both extraction and storage which are important issues in parallel profiling.



## [Checkpoint/restart approaches for a thread-based MPI runtime](/pdf/checkpoint.pdf)

*Julien Adam, Maxime Kermarquer, Jean-Baptiste Besnard, Leonardo Bautista-Gomez, Marc Pérache, Patrick Carribault, Julien Jaeger, Allen D. Malony, Sameer Shende*

Parallel Computing 85: 204-219 (2019)


Fault-tolerance has always been an important topic when it comes to running massively parallel programs at scale. Statistically, hardware and software failures are expected to occur more often on systems gathering millions of computing units. Moreover, the larger jobs are, the more computing hours would be wasted by a crash. In this paper, we describe the work done in our MPI runtime to enable both transparent and application-level checkpointing mechanisms. Unlike the MPI 4.0 User-Level Failure Mitigation (ULFM) interface, our work targets solely Checkpoint/Restart and ignores other features such as resiliency. We show how existing checkpointing methods can be practically applied to a thread-based MPI implementation given sufficient runtime collaboration. The two main contributions are the preservation of high-speed network performance during transparent C/R and the over-subscription of checkpoint data replication thanks to a dedicated user-level scheduler support. These techniques are measured on MPI benchmarks such as IMB, Lulesh and Heatdis, and associated overhead and trade-offs are discussed.


## [Mixing ranks, tasks, progress and nonblocking collectives](/pdf/mixing.pdf)

*Jean-Baptiste Besnard, Julien Jaeger, Allen D. Malony, Sameer Shende, Hugo Taboada, Marc Pérache, Patrick Carribault*

EuroMPI 2019: 10:1-10:10


Since the beginning, MPI has de!ned the rank as an implicit attribute associated with the MPI process’ environment. In particular, each MPI process generally runs inside a given UNIX process and is associated with a !xed identi!er in its WORLD communicator. However, this state of things is about to change with the rise of new abstractions such as MPI Sessions. In this paper, we propose to outline how such evolution could enable optimizations which were previously linked to speci!c MPI runtimes executing MPI processes in shared memory (e.g. thread-based MPI). By implementing runtime-level work-sharing through what we de!ne as MPI tasks, enabling the ability to progress indi"erently from stream context we show that there is potential for improved asynchronous progress. In the absence of a Session implementation, this assumption is validated in the context of a thread-based MPI where nonblocking Collective (NBC) were implemented on top of Extended Generic Requests progressed by any rank on the node thanks to an MPI extension enabling threads to dynamically share their MPI context.



## [Transparent High-Speed Network Checkpoint/Restart in MPI](/pdf/euro18.pdf)

*Julien Adam, Jean-Baptiste Besnard, Sameer Shende, Marc Pérache, Patrick Carribault, Julien Jaeger*

EuroMPI 2018



Fault-tolerance has always been an important topic when it comes to running massively parallel programs at scale. Statistically, hardware and software failures are expected to occur more often on systems gathering millions of computing units. Moreover, the larger jobs are, the more computing hours would be wasted by a crash. In this paper, we describe the work done in our MPI runtime to enable transparent checkpointing mechanism. Unlike the MPI 4.0 User-Level Failure Mitigation (ULFM) interface, our work targets solely Checkpoint/Restart (C/R) and ignores wider features such as resiliency. We show how existing transparent checkpointing methods can be practically applied to MPI implementations given a suficient collaboration from the MPI runtime. Our C/R technique is then measured on MPI benchmarks such as IMB and Lulesh relying on Inniband high-speed network, demonstrating that the chosen approach is su!ciently general and that performance is mostly preserved. We argue that enabling fault-tolerance without any modi"cation inside target MPI applications is possible, and show how it could be the "rst step for more integrated resiliency combined with failure mitigation like ULFM.


## [Unifying the Analysis of Performance Event Streams at the Consumer Interface Level](/pdf/unifying.pdf)

*Besnard, J. B., Malony, A. D., Shende, S., Pérache, M., Carribault, P., & Jaeger, J.*

In International Workshop on Parallel Tools for High Performance Computing (pp. 57-71). Springer, Cham.



Several instrumentation interfaces have been developed for parallel programs to make observable actions that take place during execution and to make accessible information about the program’s behavior and performance. Following in the footsteps of the successful profiling interface for MPI (PMPI), new rich interfaces to expose internal operation of MPI (MPI-T) and OpenMP (OMPT) runtimes are now in the standards. Taking advantage of these interfaces requires tools to selectively collect events from multiples interfaces by various techniques: function interposition (PMPI), value read (MPI-T), and callbacks (OMPT). In this paper, we present the unified instrumentation pipeline proposed by the MALP infrastructure that can be used to forward a variety of fine-grained events from multiple interfaces online to multi-threaded analysis processes implemented orthogonally with plugins. In essence, our contribution complements “front-end” instrumentation mechanisms by a generic “back-end” event consumption interface that allows “consumer” callbacks to generate performance measurements in various formats for analysis and transport. With such support, online and post-mortem cases become similar from an analysis point of view, making it possible to build more unified and consistent analysis frameworks. The paper describes the approach and demonstrates its benefits with several use cases.


## [Towards a Better Expressiveness of the Speedup Metric in MPI Context](/pdf/speedup.pdf)

*Jean-Baptiste Besnard, Allen D. Malony, Sameer Shende, Marc Pérache, Patrick Carribault, Julien Jaeger*

ICPP Workshops 2017: 251-260



Many-core processors are imposing new constraints to parallel applications. In particular, the MPI+X model or hybridization is becoming a compulsory avenue to extract performance by mitigating both memory and communication overhead. In this context, performance tools also have to evolve in order to represent more complex states combining multiple runtimes and programming models. In this paper, we propose to start from a well-known performance metric, the Speedup, showing that it can be bounded by the acceleration of any program section. From this observation, we propose a compact tool-oriented MPI abstraction providing such time slices (or phases). We demonstrate the benefits of this approach first on a simple benchmark, identifying factors limiting speedup. And second, using an MPI+OpenMP benchmark to measure OpenMP scaling solely from MPI instrumentation.



## [User Co-scheduling for MPI+OpenMP Applications Using OpenMP Semantics](/pdf/cosched.pdf)

*Antoine Capra, Patrick Carribault, Jean-Baptiste Besnard, Allen D. Malony, Marc Pérache, Julien Jaeger*

IWOMP 2017: 203-216



Recent evolutions in parallel architectures such as manycore processors are putting an end to the pure-MPI model. Simulations codes willing to productively use current and future supercomputers are bound to expose multiple levels of parallelisms inside and between nodes, combining different programming models (e.g., MPI+X). In this paper, we propose to discuss this evolution in the context of MPI+OpenMP which is a common hybridization approach. In particular, methods leveraging the OpenMP tasking constructs are presented in such hybrid context. Various approaches are discussed and compared considering codes trying to mix fine-grained computation and communications, taking advantage of recent evolutions in the OpenMP standard. Advantages and limitations of the approaches are detailed, including potential improvements to OpenMP in order ease both the integration and progress of MPI calls. These results are applied to a representative stencil code demonstrating improvements on the overall execution time thanks to an efficient mixing of MPI and OpenMP.


## [Introducing Task-Containers as an Alternative to Runtime-Stacking](/pdf/taskcont.pdf)

*Jean-Baptiste Besnard, Julien Adam, Sameer Shende, Marc Pérache, Patrick Carribault, Julien Jaeger*

EuroMPI 2016: 51-63



The advent of many-core architectures poses new challenges to the MPI programming model which has been designed for distributed memory message passing. It is now clear that MPI will have to evolve in order to exploit shared-memory parallelism, either by collaborating with other programming models (MPI+X) or by introducing new shared-memory approaches. This paper considers extensions to C and C++ to make it possible for MPI Processes to run into threads. More generally, a thread-local storage (TLS) library is developed to simplify the collocation of arbitrary tasks and services in a shared-memory context called a task-container. The paper discusses how such containers simplify model and service mixing at the OS process level, eventually easing the collocation of arbitrary tasks with MPI processes in a runtime agnostic fashion, opening alternatives to runtime stacking.


## [Gleaming the Cube: Online Performance Analysis and Visualization Using MALP](/pdf/gleaming.pdf)

*Besnard JB., Malony A.D., Shende S., Pérache M., Jaeger J.*

(2016) . In: Knüpfer A., Hilbrich T., Niethammer C., Gracia J., Nagel W., Resch M. (eds) Tools for High Performance Computing 2015. Springer, Cham



Multi-Application onLine Profiling (MALP) is a performance tool which has been developed as an alternative to the trace-based approach for fine-grained event collection. Any performance and analysis measurement system must address the problem of data management and projection to meaningful forms. Our concept of a valorization chain is introduced to capture this fundamental principle. MALP is a dramatic departure from performance tool dogma in that is advocates for an online valorization architecture that integrates data producers with transformers, consumers, and visualizers, all operating in concert and simultaneously. MALP provides a powerful, dynamic framework for performance processing, as is demonstrated in unique performance analysis and application dashboard examples. Our experience with MALP has identified opportunities for data-query in MPI context, and more generally, creating a “constellation of services” that allow parallel processes and tools to collaborate through a common mediation layer.


## [An MPI Halo-Cell Implementation for Zero-Copy Abstraction](/pdf/halo.pdf)

*Jean-Baptiste Besnard, Allen D. Malony, Sameer Shende, Marc Pérache, Patrick Carribault, Julien Jaeger*

EuroMPI 2015: 3:1-3:9



In the race for Exascale, the advent of many-core processors will bring a shift in parallel computing architectures to systems of much higher concurrency, but with a relatively smaller memory per thread. This shift raises concerns for the adaptability of HPC software, for the current generation to the brave new world. In this paper, we study domain splitting on an increasing number of memory areas as an example problem where negative performance impact on computation could arise. We identify the specific parameters that drive scalability for this problem, and then model the halo-cell ratio on common mesh topologies to study the memory and communication implications. Such analysis argues for the use of shared-memory parallelism, such as with OpenMP, to address the performance problems that could occur. In contrast, we propose an original solution based entirely on MPI programming semantics, while providing the performance advantages of hybrid parallel programming. Our solution transparently replaces halo-cells transfers with pointer exchanges when MPI tasks are running on the same node, effectively removing memory copies. The results we present demonstrate gains in terms of memory and computation time on Xeon Phi (compared to OpenMP-only and MPI-only) using a representative domain decomposition benchmark.


## [Profiling and debugging by efficient tracing of hybrid multi-threaded HPC applications](/pdf/THESE.pdf)

*Jean-Baptiste Besnard*

Versailles Saint-Quentin-en-Yvelines University, France 2014



Supercomputers’ evolution is at the source of both hardware and software challenges. In the quest for the highest computing power, the interdependence inbetween simulation components is becoming more and more impacting, requiring new approaches. This thesis is focused on the software development aspect and particularly on the observation of parallel software when being run on several thousand cores. This observation aims at providing developers with the necessary feedback when running a program on an execution substrate which has not been modeled yet because of its complexity. In this purpose, we firstly introduce the development process from a global point of view, before describing developer tools and related work. In a second time, we present our contribution which consists in a trace based profiling and debugging tool and its evolution towards an on-line coupling method which as we will show is more scalable as it overcomes IOs limitations. Our contribution also covers our time-stamp synchronisation algorithm for tracing purposes which relies on a probabilistic approach with quantified error. We also present a tool allowing machine characterisation from the MPI aspect and demonstrate the presence of machine noise for both point to point and collectives, justifying the use of an empirical approach. In summary, this work proposes and motivates an alternative approach to trace based event collection while preserving event granularity and a reduced overhead.


## [Event Streaming for Online Performance Measurements Reduction](/pdf/streaming.pdf)

*Jean-Baptiste Besnard, Marc Pérache, William Jalby*

ICPP 2013: 985-994



As the power of supercomputers is exponentially increasing, programmers are facing complex codes designed to comply with today’s challenging architectural constraints. In such context, the use of tools within the development cycle, is becoming crucial in order to optimise applications at scale. However, it is not possible to obtain all measurements one can think of, because of the cost to produce, store and analyse large amounts of instrumentation-data. Moreover, the file-system is becoming a critical resource, subject to performance and even stability problems under load. This emphasises the need for an alternative approach to trace data management. This paper proposes an alternative to trace-based coupling between instrumentation and analysis. We present a distributed analysis engine, providing concurrent application profiling, thanks to runtime coupling. After demonstrating the advantages of this method in terms of parallelism, we present performance results and sample outputs for NAS-MPI benchmarks and a representative C++ MPI application.
