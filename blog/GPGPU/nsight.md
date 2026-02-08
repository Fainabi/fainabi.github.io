# Nsight Systems/Compute

It is known that data movement, parallelization, streaming, synchronization, memory access (and more) are the key points to GPU performance. Therefore we need a tool for them. For CUDA, they are Nsight products. More specifically, Nsight systems can use `nsys` for profiling system in CLI; Nsight compute can use `ncu` or `nv-nsight-cu-cli` for profiling kernel. NVTX is an programming extension that supports make annotations in the codes for better profiling. `cuda-gdb` is the cuda debugger that supports inspecting internal states of cuda programming and debugging on them. Nsight system and compute is now integrated into CUDA toolkit.

The Nsight system is a systematic level for profiling the performance of GPU and CPU. It can analyze the memory, GPU, CPU and I/O to locate the bottleneck of a program. The Nsight compute aims to give fine-grained analysis inside a kernel function, and provides usage on SM, register throughput, warps and stalls. 


# External Resources

1. [Nsight Systems User Guide](https://docs.nvidia.com/nsight-systems/UserGuide/index.html)
2. [Nsight Systems Getting Started](https://developer.nvidia.com/nsight-systems/get-started)
3. [CUDA debugger](https://docs.nvidia.com/nsight-visual-studio-edition/cuda-debugger/index.html)

