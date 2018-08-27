var maxid = window.maxid
var wall = window.wall
/**
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 idle，action 才会执行
 * @param idle   {number}    空闲时间，单位毫秒
 * @param action {function}  请求关联函数，实际应用需要调用的函数
 * @return {function}    返回客户调用函数
 */
var debounce = function (idle, action) {
	var last
	return function () {
		var ctx = this,
			args = arguments
		clearTimeout(last)
		last = setTimeout(function () {
			action.apply(ctx, args)
		}, idle)
	}
}

var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
window.addEventListener(resizeEvt, debounce(1000, resize))
/**
 * 当浏览器大小改变时
 */
function resize() {
	var X = parseInt(document.body.clientWidth / 50)
	var Y = parseInt(document.body.clientHeight / 50)
	console.log({
		width: X,
		height: Y
	})
	window.imgXYarr = wall.roa(wall.createArr(X, Y))
	for (var index = 0; index < maxid; index++) {
		var x = window.imgXYarr[index % (X * Y)].x
		var y = window.imgXYarr[index % (X * Y)].y
		var Ele = $('#' + index)
		if (Ele.length > 0) {
			Ele.css({
				left: x * 50 + 'px',
				top: y * 50 + 'px',
				position: 'absolute',
				width: '50px'
			})
		}
	}
}