# Streaming

The workflow of GPU with CPU is a loop:
- send data from CPU to GPU (host to device)
- call GPU kernels by CPU (device)
- CPU do other works (host)
- CPU downloads data from GPU (device to host)

The data transferring and kernels of different task can be parallelized, which are scheduled by the cuda async engines.

```c
cudaError_t cudaGetDeviceCount(int * count);  // the available devices
cudaError_t cudaGetDeviceProperties(struct cudaDeviceProp * prop, int device);  // get property of the device
```
Here `cudaDeviceProp` contains comprehensive properties about device such as `name` and `asyncEngineCount` attributes to get the name and the number of async engines for that device.


# External Resource

1. [一文读懂cuda stream与cuda event](https://zhuanlan.zhihu.com/p/699754357)