# CPU vs GPU, as Latency vs Throughput

CPU is a latency machine, whose efficiency is improved by reducing latency (of computing and data accessing).
GPU is a throughput machine, whose efficiency is improved via effective pipeline and SIMD (single instruction multiple data).
TPU is designed for deep learning, embracing extensibility on matrix (or tensor) operations.

## Architecture

CPU and its accessible DRAM (and disk storage), form a architecture of computing system. ALU (arithmetic logic unit) is responsible for computation and memory accessing. The direct (and latest) parts the ALU can access are registers. The next layer is cache, form L1 (banked, means instruction and data are stored using different cache), L2 to L3 caches. L2 and L3 caches are shared and L1 is private. Off the cpu is the dynamic random access memory (DRAM). 

GPU architecture is also hierarchical. Each GPU core is also designed with L1, L2, L3 cache, but since there are a great number of GPU cores, how to arrange these cores and distribute caches is a problem. A solution is to group GPU cores together, and further group the groups together. That is called thread hierarchy, where **warp**, **block** and **streaming multiprocessor** are defined. Let's view them from top to down.

In CUDA, streaming multiprocessor (SM) is a complete dependent part for computing. An SM has its own shared memory pool (L1 cache) and a number of cores for executing instructions. Between the SMs are L2, L3 caches and HBM (high bandwidth memory). In CUDA, thread is the basic unit. A warp is a group of 32 parallel threads. Each thread contains its own instruction address counter and register state therefore they can execute branch independently ([CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#simt-architecture)). An SM can execute multiple warps asynchronously, with several (2 or 4) warp schedulers. The number of warps an SM can handled is limited (e.g. 48 or more), and that extends the conception of blocks. A (thread) block is a logical unit in CUDA code, which we align the parallel task to. A block is assigned to an SM, therefore the (thread) size of a block should not exceed the limitation. Nevertheless, it is encouraged to assign a lot threads to a block, as the pipeline would hide latency. CUDA supports high dimensional block, and when dividing the block into warps, the threads are gathered in row-major order.

Besides thread hierarchy, the memory hierarchy is also key point to CUDA programming. In the threads block view, each thread is held by a core thereby has its own registers and local memory. Each block is assigned to an SM thereby each block maintains a shared memory for the threads. SMs are connected via HBM then connected hosted CPU via PCIE. These is also a global constant memory.

## CUDA Kernel/Function

A kernel is a code snippet (wrapped by a kernel function) that can be invoked by hosted or device. The kernel/function are annotated with CUDA qualifier: 

- `__global__`: invoked by host, executed at device
- `__device__`: invoked by device, executed at device
- `__host__`: invoked by host, executed at host
- `__host__ __device`: invoked and executed by both

When invoking kernel at host, a special syntax is written as:
```c
__global__ void add(int *a, int *b, int *c) {
    int i = threadIdx.x;
    c[i] = a[i] + b[i];
}

add<<<numBlocks, threadPerBlock>>>(d_a, d_b, d_c);
```

where `numBlocks` and `threadPerBlock` can be defined as `int` or `dim3`. `dim3` is a defined as a struct:
```c
struct dim3 {
    unsigned int x, y, z;
}
```
It has default 
```c
__host__ __device__ constexpr dim3(unsigned int vx = 1, unsigned int vy = 1, unsigned int vz = 1) : x(vx), y(vy), z(vz) {}
```
therefore a 1D, 2D, and 3D data layout can be constructed.

As mentioned before, each block is maintained by an SM, that yields the concept of grid. A grid is a (3D) tensor of blocks and a block is a (3D) tensor of threads. That means:
- Each kernel has a grid with size of `gridDim: dim3`, indicating the number of blocks
- Each block can be indexed by `blockIdx: dim3`
- Each block has a size `blockDim: dim3`, indicating the number of threads
- Each thread in the block can be indexed by `threadIdx: dim3`

The global index in the global tensor can be determined as:
```c
int x = blockIdx.x * blockDim.x + threadIdx.x;
int y = blockIdx.y * blockDim.y + threadIdx.y;
int z = blockIdx.z * blockDim.z + threadIdx.z;
```

Since the dimensions are row first, the global thread index can be calculated as:
```c
int threadId = z * (blockDim.x * gridDim.x) * (blockDim.y * gridDim.y)
             + y * (blockDim.x * gridDim.x)
             + x;
```


# External Resources

1. [Introduction to GPGPU Programming](https://ajdillhoff.github.io/notes/introduction_to_gpgpu_programming/)
2. [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html)
3. [Cache hierarchy](https://en.wikipedia.org/wiki/Cache_hierarchy)