var maxid = window.maxid
var imgXYarr = window.imgXYarr
var wall = {
	/** 
	 * 建立一个直角坐标系
	 * @param x
	 * @param y
	 * @return {Array} 返回一个顺序的坐标数组
	 * createArr(几行, 几列)
	 */
	createArr: function createArr(x, y) {
		var arr = new Array()
		for (var i = 0; i < x; i++) {
			for (var j = 0; j < y; j++) {
				arr.push({
					x: i,
					y: j
				})
			}
		}
		return arr
	},
	/* 
	 * 打乱数组
	 * 返回乱序的新数组
	 */
	roa: function roa(arr) //arr为可能出现的元素集合
	{
		var temp = new Array() //temp存放生成的随机数组
		var count = arr.length
		for (var i = 0; i < count; i++) {
			var num = Math.floor(Math.random() * arr.length) //生成随机数num
			temp.push(arr[num]) //获取arr[num]并放入temp
			arr.splice(num, 1)
		}
		return temp
	},
	/* 
	 * 创建动画完成事件
	 * 通过创建一个div元素，判断他的style属性来确定
	 * 返回带有当前浏览器前缀的“动画完成事件”
	 */
	animationEnd: function animationEnd() {
		var el = document.createElement('div')
		// 各种浏览器的动画完成事件
		var animations = {
			animation: 'animationend',
			OAnimation: 'oAnimationEnd',
			MozAnimation: 'mozAnimationEnd',
			WebkitAnimation: 'webkitAnimationEnd',
		}
		// 枚举事件是否定义
		for (var t in animations) {
			if (el.style[t] !== undefined) {
				// 返回事件
				return animations[t]
			}
		}
	},

	/** 
	 * 向页面插入头像 
	 * @param src  {string} 头像的路径
	 * @param id {number} 用户的id
	 * @param x {number} 在x轴的位置
	 * @param y {number} 在y轴的位置
	 * @return {Element} 产生的元素
	 */
	addImg: function addImg(src, id, x, y) {
		if (id > maxid) {
			maxid = id
		}
		try {
			if (src != undefined && x != undefined && y != undefined) {
				var imgEl
				if ($('#' + id).length > 0) {
					imgEl = $('#' + id).attr({
						src: src
					}).css({
						left: x * 50 + 'px',
						top: y * 50 + 'px',
						position: 'absolute',
						width: '50px'
					})
				} else {
					imgEl = $('<img>').attr({
						id: id,
						src: src
					}).css({
						left: x * 50 + 'px',
						top: y * 50 + 'px',
						position: 'absolute',
						width: '50px'
					}).addClass('animated imgAnimation').appendTo('.tx').one(
						this.animationEnd(),
						function () {
							$(this).addClass('animated fast flash')
						})
				}
				return imgEl
			} else {
				throw new Error('缺少参数')
			}
		} catch (error) {
			console.log('创建图片失败', error, src, x, y)
		}
	},
	showAllItems: function showAllItems(data) {
		var self = this
		var items = data.Item
		var timesRun = 0
		// 测试图片
		var img = items
		// 创建定时器，重复执行items.length次，延时s，遍历数组
		var interval = setInterval(function () {
			console.log("添加", timesRun + 1, "个")
			if (timesRun + 1 === items.length) {
				// 清除定时器
				clearInterval(interval)
				console.log("结束")
			}
			var src = img[timesRun].hear_img
			var id = img[timesRun].id
			// 插入图片
			self.addImg(src,
				id,
				imgXYarr[timesRun % imgXYarr.length].x,
				imgXYarr[timesRun % imgXYarr.length].y
			)
			timesRun += 1
		}, 1)
	}
}