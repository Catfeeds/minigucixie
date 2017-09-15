<?php
// 本类由系统自动生成，仅供测试用途
namespace Api\Controller;
use Think\Controller;
class ProductController extends PublicController {
	//***************************
	//  获取商品详情信息接口
	//***************************
    public function index(){
		$product=M("product");

		$pro_id = intval($_REQUEST['pro_id']);
		if (!$pro_id) {
			echo json_encode(array('status'=>0,'err'=>'商品不存在或已下架！'));
			exit();
		}
		
		$pro = $product->where('id='.intval($pro_id).' AND del=0 AND is_down=0')->find();
		if(!$pro){
			echo json_encode(array('status'=>0,'err'=>'商品不存在或已下架！'.__LINE__));
			exit();
		}

		$pro['photo_x'] =__DATAURL__.$pro['photo_x'];
		$pro['photo_d'] = __DATAURL__.$pro['photo_d'];
		$pro['brand'] = M('brand')->where('id='.intval($pro['brand_id']))->getField('name');
		$pro['cat_name'] = M('category')->where('id='.intval($pro['cid']))->getField('name');
		$pro['shouhou'] = '卖家提供售后服务';
		$pro['paytypes'] = '微信支付';
		$pro['canshulist'] = array();

		//图片轮播数组
		$img=explode(',',trim($pro['photo_string'],','));
		$b=array();
		if ($pro['photo_string']) {
			foreach ($img as $k => $v) {
				$b[] = __DATAURL__.$v;
			}
		}else{
			$b[] = $pro['photo_d'];
		}
		$pro['img_arr']=$b;//图片轮播数组
		
		//处理产品属性
		$b=array();$d = array();$buff=array();
		if(intval($pro['is_buff'])>0) { //如果产品属性有值才进行数据组装
			$pro_buff = M('attribute')->where('pro_id='.intval($pro_id))->field('id')->select();
			foreach ($pro_buff as $k => $value) {
				$a = M('guige')->where('pid='.intval($pro_id).' AND attr_id='.intval($value['id']))->field('id')->select();
				foreach ($a as $key => $val) {
					$b[$k][] = $val['id'];
				}
			}

			//组合所有规格属性
			foreach ($b[0] as $k => $v) {
				if ($b[1]) {
					foreach ($b[1] as $k1 => $v1) {
						if ($b[2]) {
							foreach ($b[2] as $k2 => $v2) {
								if ($b[3]) {
									foreach ($b[3] as $k3 => $v3) {
										$d[] = $v.','.$v1.','.$v2.','.$v3;
									}
								}else{
									$d[] = $v.','.$v1.','.$v2;
								}
							}
						}else{
							$d[] = $v.','.$v1;
						}
					}
				}else{
					$d[] = $v;
				}
			}
			//构建数组
			$buff = array();
			foreach ($d as $k => $v) {
				$valarr = explode(',', $v);
				$arrs = array();$arrsss = array();
				foreach ($valarr as $key => $val) {
					$gg = M('guige')->where('id='.intval($val))->find();
					$arrs['attrKey'] = M('attribute')->where('id='.intval($gg['attr_id']))->getField('attr_name');
					$arrs['attrId'] = intval($gg['attr_id']);
					$arrs['guigeId'] = intval($gg['id']);
					$arrs['attrValue'] = $gg['name'];
					$arrsss[] = $arrs;
				}
				$buff[$k]['priceId'] = $k;
				$buff[$k]['attrValueList'] = $arrsss;
			}
		}

		$content = str_replace('/minigucixie/Data/', __DATAURL__, $pro['content']);
		$pro['content']=html_entity_decode($content, ENT_QUOTES ,'utf-8');

		//检测产品是否收藏
		$col = M('product_sc')->where('uid='.intval($_REQUEST['uid']).' AND pid='.intval($pro_id))->getField('id');
		if ($col) {
			$pro['collect']= 1;
		}else{
			$pro['collect']= 0;
		}

		//商品评价
		$comment = M('product_dp')->where('pid='.$pro_id.' AND audit=1')->select();
		if($comment){
			foreach($comment as $k => $v){
				$comment[$k]['username'] = M('user')->where('id='.intval($v['uid']))->getField('uname');
			}
		}
		echo json_encode(array('status'=>1,'pro'=>$pro,'buff'=>$buff,'comment'=>$comment));
		exit();

	}

	public function lists(){
 		$json="";
 		$id=I("request.cat_id");//获得分类id 这里的id是pro表里的cid
 		$brand_id=I("request.brand_id");//获得品牌id 这里的id是brand表里的cid
 		$condition=I("request.orders");//筛选条件
 		$sort=I("request.sort");//排序顺序
 		//$type=I('post.type');//排序类型
 		$keyword=I('post.keyword');
 		//排序
 		if(!$condition){
 			$order="addtime desc,shiyong desc,id desc";
 		}else{
			if($condition=='zh'){
	 			$order="addtime desc,shiyong desc,id desc";
	 		}elseif($condition=='asale'){
	 			$order="shiyong";
	 		}elseif($condition=='dsale'){
	 			$order="shiyong desc";
	 		}elseif($condition=='aprice'){
	 			$order="price_yh";
	 		}elseif($condition=='dprice'){
	 			$order="price_yh desc";
	 		}elseif($condition=='atime'){
	 			$order="addtime desc";
	 		}
 		}
 		//条件
 		$where="1=1 AND pro_type=1 AND del=0 AND is_down=0";
 		if(intval($id)){
 			$where.=" AND cid=".intval($id);
 		}
 		if (intval($brand_id)) {
 			$where.=" AND brand_id=".intval($brand_id);
 		}
 		if($keyword) {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }
        if (isset($_REQUEST['ptype']) && $_REQUEST['ptype']=='new') {
        	$where .=' AND is_show=1'; 
        }

 		$product=M('product')->where($where)->order($order)->limit(20)->select();
 		//echo M('product')->_sql();exit;
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price']=$v['price'];
 			$json['price_yh']=$v['price_yh'];
 			$json['shiyong']=$v['shiyong'];
 			$json['renqi']=$v['renqi'];
 			$json['company']=$v['company'];
 			$json_arr[] = $json;
 		}
 		$cat_name=M('category')->where("id=".intval($id))->getField('name');
 		echo json_encode(array('status'=>1,'pro'=>$json_arr,'cat_name'=>$cat_name,'brand_id'=>$brand_id));
 		exit();
    }
    public function getlist(){
    	$json="";
 		$id=I("request.cat_id");//获得分类id 这里的id是pro表里的cid
 		$brand_id=I("request.brand_id");//获得品牌id 这里的id是brand表里的cid
 		$condition=I("request.condition");//筛选条件
 		$sort=I("request.sort");//排序顺序
 		// $id=44;
 		$type=I('post.type');//排序类型

 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*20)-20;

 		$keyword=I('post.keyword');
 		//排序
 		if(!$condition){
 			$order="addtime desc,shiyong desc,id desc";
 		}else{
			if($condition=='zonghe'){
	 			$order="addtime desc,shiyong desc,id desc";
	 		}elseif($condition=='sell'){
	 			$order="shiyong ".$sort;
	 		}elseif($condition=='price'){
	 			$order="price_yh ".$sort;
	 		}elseif($condition=='new'){
	 			$order="addtime desc";
	 		}
 		}
 		//条件
 		$where="1=1 AND pro_type=1 AND del=0 AND is_down=0";
 		if(intval($id)){
 			$where.=" AND cid=".intval($id);
 		}
 		if (intval($brand_id)) {
 			$where.=" AND brand_id=".intval($brand_id);
 		}
 		if($keyword) {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }
        if (isset($_REQUEST['ptype']) && $_REQUEST['ptype']=='new') {
        	$where .=' AND is_show=1'; 
        }

 		$product=M('product')->where($where)->order($order)->limit($limit.',20')->select();
 		//echo M('product')->_sql();exit;
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price']=$v['price'];
 			$json['price_yh']=$v['price_yh'];
 			$json['shiyong']=$v['shiyong'];
 			$json['renqi']=$v['renqi'];
 			$json['company']=$v['company'];
 			$json_arr[] = $json;
 		}
 		echo json_encode(array('status'=>1,'pro'=>$json_arr));
 		exit();
    }
    //*******************************
	//  商品列表页面 获取更多接口
	//*******************************
    public function get_more(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid
 		// $id=44;
 		$type=I('post.orders');//排序类型

 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*8)-8;

 		$keyword=I('post.keyword');
 		//排序
 		$order="sort asc,shiyong desc,addtime asc";//默认按添加时间排序
 		if($type=='dsale'){
 			//销量降序
 			$order="shiyong desc";
 		}elseif($type=='asale'){
 			//销量升序
 			$order="shiyong asc";
 		}elseif($type=='aprice'){
 			//价格升序
 			$order="price_yh asc";
 		}elseif($type=='dprice'){
 			//价格降序
 			$order="price_yh desc";
 		}elseif($type=='atime'){
 			//时间降序
 			$order="addtime desc";
 		}
 		//条件
 		$where="pro_type=1 AND del=0 AND is_down=0";
 		if(intval($id)){
 			//判断是不是一级分类，是则查询该分类下的所有二级分类id
 			$tid = M('category')->where('id='.intval($id))->field('id,tid')->find();
 			if (intval($tid['tid'])==1) {
 				$ids = M('category')->where('tid='.intval($tid['id']))->field('id')->select();
 				$arr = array();
 				foreach ($ids as $k => $v) {
 					$arr[] = $v['id'];
 				}
 				$arrstr = implode($arr, ',');
 				$where.=" AND cid IN (".$arrstr.")";
 			}else{
 				$where.=" AND cid=".intval($id);
 			}
 		}

 		if($keyword && $keyword!='undefined') {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }

 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		//echo M('product')->_sql();exit;
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price']=$v['price'];
 			$json['price_yh']=$v['price_yh'];
 			$json['shiyong']=$v['shiyong'];
 			$json['intro']=$v['intro'];
 			$json['is_show'] = intval($v['is_show']);
 			$json['is_hot'] = intval($v['is_hot']);
 			$json_arr[] = $json;
 		}

 		echo json_encode(array('pro'=>$json_arr));
 		exit();
    }

    //*******************************
	//  商品列表页面 获取更多接口
	//*******************************
    public function getcatpro(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid
 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*8)-8;

 		//排序
 		$order="sort asc,shiyong desc,addtime asc";//默认按添加时间排序
 		//条件
 		$where="pro_type=1 AND del=0 AND is_down=0";
 		if(intval($id)){
 			//判断是不是一级分类，是则查询该分类下的所有二级分类id
 			$tid = M('category')->where('id='.intval($id))->field('id,tid')->find();
 			if (intval($tid['tid'])==1) {
 				$ids = M('category')->where('tid='.intval($tid['id']))->field('id')->select();
 				$arr = array();
 				foreach ($ids as $k => $v) {
 					$arr[] = $v['id'];
 				}
 				$arrstr = implode($arr, ',');
 				$where.=" AND cid IN (".$arrstr.")";
 			}else{
 				$where.=" AND cid=".intval($id);
 			}
 		}

 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price']=$v['price'];
 			$json['price_yh']=$v['price_yh'];
 			$json['num']=$v['num'];
 			$json['intro']=$v['intro'];
 			$json['is_show'] = intval($v['is_show']);
 			$json['is_hot'] = intval($v['is_hot']);
 			$json_arr[] = $json;
 		}

 		//获取该分类下的推荐产品
 		$info = array();
 		$catimg = M('catimg')->where('cat_id='.intval($id).' AND state=1')->find();
 		if ($catimg) {
 			$pro_id = intval($catimg['pro_id']);
 			$proinfo = M('product')->where('id='.intval($pro_id))->field('name,intro')->find();
 			$info['pro_id'] = $pro_id;
 			$info['pro_name'] = $proinfo['name'];
 			$info['intro'] = $proinfo['intro'];
 			//处理图片
 			$imgarr = array();
 			if ($catimg['img_str']!='') {
 				$img = explode(',', trim($catimg['img_str'],','));
	 			foreach ($img as $val) {
	 				$imgarr[] = __DATAURL__.$val;
	 			}
 			}
 			$info['img'] = $imgarr;
 		}
 		$concent = M('category')->where('id='.intval($id))->getField('concent');
 		echo json_encode(array('pro'=>$json_arr,'info'=>$info,'con'=>$concent));
 		exit();
    }

    //**********************************
	//  会员商品 属性价格库存获取
	//**********************************
    public function getprice(){
    	$pid = intval($_REQUEST['pid']);
    	$info = trim($_REQUEST['attrs'],',');
    	if (!$pid || !$info) {
    		echo json_encode(array('status'=>0));
			exit();
    	}

    	$attrs = array();
    	$attrs = explode(',', $info);
    	$price = array();$stock = array();
    	foreach ($attrs as $k => $v) {
    		$gg = M('guige')->where('pid='.intval($pid).' AND name="'.$v.'"')->find();
    		$attr_id = M('attribute')->where('id='.intval($gg['attr_id']).' AND pro_id='.intval($pid))->getField('id');
    		if (!$gg || !intval($attr_id)) {
    			echo json_encode(array('status'=>0));
				exit();
    		}
    		$price[] = floatval($gg['price']);
    		$stock[] = intval($gg['stock']);
    	}

    	rsort($price);
    	sort($stock);
    	$theprice = sprintf("%.2f",$price[0]);
    	$thestock = $stock[0];
    	echo json_encode(array('status'=>1,'price'=>$theprice,'stock'=>intval($thestock)));
    	exit();
    }

	//***************************
	//  会员商品收藏接口
	//***************************
	public function col(){
		$uid = intval($_REQUEST['uid']);
		$pid = intval($_REQUEST['pid']);
		if (!$uid || !$pid) {
			echo json_encode(array('status'=>0,'err'=>'系统错误，请稍后再试.'));
			exit();
		}

		$check = M('product_sc')->where('uid='.intval($uid).' AND pid='.intval($pid))->getField('id');
		if ($check) {
			$res = M('product_sc')->where('id='.intval($check))->delete();
		}else{
			$data = array();
			$data['uid'] = intval($uid);
			$data['pid'] = intval($pid);
			$res = M('product_sc')->add($data);
		}
		
		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		}else{
			echo json_encode(array('status'=>0,'err'=>'网络错误..'));
			exit();
		}
	}


}