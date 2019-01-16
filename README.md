
腾讯地图WebService API 是基于HTTPS/HTTP协议的数据接口，开发者可以使用任何客户端、服务器和开发语言，按照腾讯地图WebService API规范，按需构建HTTPS请求，并获取结果数据（目前支持JSON/JSONP方式返回）。
可以在小程序中调用腾讯位置服务的**POI检索**、**关键词输入提示**、**地址解析**、**逆地址解析**、**出行方式**、**行政区划**和**距离时间计算**等数据服务。 <br>

使用腾讯地图SDK ； 目前已有功能：搜索，关键字，地址列表，pio点，出行方式，规划路线，具体路线信息，城市选择...
**腾讯地图官方sdk文档**：  https://lbs.qq.com/qqmap_wx_jssdk/index.html
参看以上地址，请自行按步骤配置环境.....

- 功能1：搜索[关键字，分类]；
- 功能2：出行方式[驾车，步行，骑行，公交]；
- 功能3：规划的出行路线[到标记的点]；
- 功能4：poi点[地图上可见的建筑点]；
- 功能5：搜索出的地址列表[地址名，路程距离，花费时间等]；
- 功能6：具体行走的路线信息的过程（这个有点复杂-[注意看文档](https://lbs.qq.com/webservice_v1/guide-road.html)）；
- 功能7：城市的选择 [注意看文档](https://lbs.qq.com/webservice_v1/guide-region.html) <br>  
![![地图默认情况][1]][2] <br>  
![关键字搜索][3] <br>  
![关键字分类、地址列表][4] <br>  
![pio点][5] <br>  
![具体行走的路线信息的过程][6] <br>  
![城市选择][7] <br>  

  [1]: https://img-blog.csdnimg.cn/20190102153648257.png
  [2]: https://img-blog.csdnimg.cn/20190102153648257.png
  [3]: https://img-blog.csdnimg.cn/2019010215372291.png
  [4]: https://img-blog.csdnimg.cn/20190102153804472.png
  [5]: https://img-blog.csdnimg.cn/20190102153845166.png
  [6]: https://img-blog.csdnimg.cn/20190103170636968.png
  [7]: https://img-blog.csdnimg.cn/2019011111263548.png
