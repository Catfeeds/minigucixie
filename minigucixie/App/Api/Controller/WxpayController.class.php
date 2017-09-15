<?php
namespace Api\Controller;
use Think\Controller;
class WxpayController extends Controller{
	//构造函数
    public function _initialize(){
    	//php 判断http还是https
    	$this->http_type = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')) ? 'https://' : 'http://';
		vendor('WeiXinpay.wxpay');
	}

	//***************************
	//  微信支付 接口
	//***************************
	public function wxpay(){
		$pay_sn = trim($_REQUEST['order_sn']);
		if (!$pay_sn) {
			echo json_encode(array('status'=>0,'err'=>'支付信息错误！'));
			exit();
		}

		$order_info = M('order')->where('order_sn="'.$pay_sn.'"')->find();
		if (!$order_info) {
			echo json_encode(array('status'=>0,'err'=>'没有找到支付订单！'));
			exit();
		}

		if (intval($order_info['status'])!=10) {
			echo json_encode(array('status'=>0,'err'=>'订单状态异常！'));
			exit();
		}

		//①、获取用户openid
		$tools = new \JsApiPay();
		$openId = M('user')->where('id='.intval($order_info['uid']))->getField('openid');
		if (!$openId) {
			echo json_encode(array('status'=>0,'err'=>'用户状态异常！'));
			exit();
		}
		//$openId = 'oVjTt0EsH0dbqMY5bNGQQ2RsZcXA';

		//②、统一下单
		$input = new \WxPayUnifiedOrder();
		$input->SetBody("SPA产品购买_".trim($order_info['order_sn']));
		$input->SetAttach("SPA产品购买_".trim($order_info['order_sn']));
		$input->SetOut_trade_no($pay_sn);
		$input->SetTotal_fee(floatval($order_info['amount'])*100);
		$input->SetTime_start(date("YmdHis"));
		$input->SetTime_expire(date("YmdHis", time() + 3600));
		$input->SetGoods_tag("SPA产品购买_".trim($order_info['order_sn']));
		$input->SetNotify_url('https://gzleren.com/minispa/index.php/Api/Wxpay/notify');
		$input->SetTrade_type("JSAPI");
		$input->SetOpenid($openId);
		$order = \WxPayApi::unifiedOrder($input);
		//echo '<font color="#f00"><b>统一下单支付单信息</b></font><br/>';
		// $jsApiParameters = $tools->GetJsApiParameters($order);
		// if (!$jsApiParameters) {
		// 	echo json_encode(array('status'=>0,'err'=>'err：订单异常！'));
		// 	exit();
		// }
		//$jsdata = json_decode($jsApiParameters,true);
		
		$arr = array();
		$arr['appId'] = $order['appid'];
		$arr['nonceStr'] = $order['nonce_str'];
		$arr['package'] = "prepay_id=".$order['prepay_id'];
		$arr['signType'] = "MD5";
		$arr['timeStamp'] = (string)time();
		$str = $this->ToUrlParams($arr);
		$jmstr = $str."&key=".\WxPayConfig::KEY;
		$arr['paySign'] = strtoupper(MD5($jmstr));
		echo json_encode(array('status'=>1,'arr'=>$arr));
		exit();
		//获取共享收货地址js函数参数
		//$editAddress = $tools->GetEditAddressParameters();
		//$this->assign('jsApiParameters',$jsApiParameters);
		//$this->assign('editAddress',$editAddress);
	}

	//***************************
	//  支付回调 接口
	//***************************
	public function notify(){
		/*$notify = new \PayNotifyCallBack();
		$notify->Handle(false);*/

		$res_xml = file_get_contents("php://input");
		libxml_disable_entity_loader(true);
		$ret = json_decode(json_encode(simplexml_load_string($res_xml,'simpleXMLElement',LIBXML_NOCDATA)),true);

		$path = "./Data/log/";
		if (!is_dir($path)){
			mkdir($path,0777);  // 创建文件夹test,并给777的权限（所有权限）
		}
		$content = date("Y-m-d H:i:s").'=>'.json_encode($ret);  // 写入的内容
		$file = $path."weixin_".date("Ymd").".log";    // 写入的文件
		file_put_contents($file,$content,FILE_APPEND);  // 最简单的快速的以追加的方式写入写入方法，

		$data = array();
		$data['order_sn'] = $ret['out_trade_no'];
		$data['pay_type'] = 'weixin';
		$data['trade_no'] = $ret['transaction_id'];
		$data['total_fee'] = $ret['total_fee'];
		$result = $this->orderhandle($data);
		if (is_array($result)) {
			$xml = "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg>";
			$xml.="</xml>";
			echo $xml;
		}else{
			$contents = 'error => '.json_encode($result);  // 写入的内容
			$files = $path."error_".date("Ymd").".log";    // 写入的文件
			file_put_contents($files,$contents,FILE_APPEND);  // 最简单的快速的以追加的方式写入写入方法，
			echo 'fail';
		}
	}

	//***************************
	//  订单处理 接口
	//***************************
	public function orderhandle($data){
		$order_sn = trim($data['order_sn']);
		$pay_type = trim($data['pay_type']);
		$trade_no = trim($data['trade_no']);
		$total_fee = floatval($data['total_fee']);
		$check_info = M('order')->where('order_sn="'.$order_sn.'"')->find();
		if (!$check_info) {
			return "订单信息错误...";
		}

		if ($check_info['status']<10 || $check_info['back']>'0') {
			return "订单异常...";
		}

		if ($check_info['status']>10) {
			return array('status'=>1,'data'=>$data);
		}

		$up = array();
		$up['type'] = $pay_type;
		$up['price_h'] = sprintf("%.2f",floatval($total_fee/100));
		$up['status'] = 20;
		$up['trade_no'] = $trade_no;
		$res = M('order')->where('order_sn="'.$order_sn.'"')->save($up);
		if ($res) {
			//处理优惠券
			if (intval($check_info['vid'])) {
				$vou_info = M('user_voucher')->where('uid='.intval($check_info['uid']).' AND vid='.intval($check_info['vid']))->find();
				if (intval($vou_info['status'])==1) {
					M('user_voucher')->where('id='.intval($vou_info['id']))->save(array('status'=>2));
				}
			}

			//赠送积分
			$oid = M('order')->where('order_sn="'.$order_sn.'"')->getField('id');
			$uid = M('order')->where('order_sn="'.$order_sn.'"')->getField('uid');
			$pro = M('order_product')->where('order_id='.intval($oid))->select();
			$num = 0;
			foreach ($pro as $k => $v) {
				$num += M('product')->where('id='.intval($v['pid']))->getField('price_jf');
			}
			if($num>0){
				$jifen_tmp = M('user')->where('id='.intval($uid))->getField('jifen');
				$temp['jifen'] = intval($jifen_tmp)+intval($num);
				M('user')->where('id='.intval($uid))->save($temp);
			}
			
		}else{
			return '订单处理失败...';
		}
	}

	//***************************
	//  赠送 符号条件的体验券
	//***************************
	public function getcoupons($data){
		$price = floatval($data['amount']);
		$uid = intval($data['uid']);
		$order_id = intval($data['id']);

		if (!$price || !$uid) {
			return array('status'=>1);
		}

		//判断会员是否领取过,领取过的就不能再领了
		$checkuser = M('coupons')->where('uid='.intval($uid))->getField('id');
		if ($checkuser) {
			return array('status'=>1);
		}

		//判断是否有符合条件的体验券
		$infoid = M('coupons')->where('state=0 AND oprice<='.floatval($price))->order('oprice desc')->getField('id');
		//没有符合的就算了
		if (intval($infoid)==0) {
			return array('status'=>1);
		}

		$up = array();
		$up['state'] = 1;
		$up['uid'] = $uid;
		$up['order_id'] = $order_id;
		$up['gettime'] = time();
		$up['offtime'] = strtotime("+3 month");
		$add = M('coupons')->where('id='.intval($infoid))->save($up);
		if ($add) {
			return array('status'=>1);
		}else{
			return '体验券推送失败...';
		}

	}

	//构建字符串
	private function ToUrlParams($urlObj)
	{
		$buff = "";
		foreach ($urlObj as $k => $v)
		{
			if($k != "sign"){
				$buff .= $k . "=" . $v . "&";
			}
		}
		
		$buff = trim($buff, "&");
		return $buff;
	}
}
?>