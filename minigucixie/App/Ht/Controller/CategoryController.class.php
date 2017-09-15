<?php
namespace Ht\Controller;
use Think\Controller;
class CategoryController extends PublicController{

	/*
	*
	* 构造函数，用于导入外部文件和公共方法
	*/
	public function _initialize(){
		$this->category = M('category');
		// 获取所有分类，进行关系划分
		$list = $this->category->where('tid=0 AND bz_4<2')->order('sort asc,id asc')->field('id,tid,name,bz_2,bz_4')->select();
		foreach ($list as $k1 => $v1) {
			$list[$k1]['list2'] = $this->category->where('tid='.intval($v1['id']))->order('sort asc,id asc')->field('id,tid,name,bz_2,sort')->select();
			foreach ($list[$k1]['list2'] as $k2 => $v2) {
				$list[$k1]['list2'][$k2]['list3'] = $this->category->where('tid='.intval($v2['id']))->order('sort asc,id asc')->field('id,tid,name,bz_2,sort')->select();
			}
		}

		$this->assign('list',$list);// 赋值数据集
	}

	/*
	*
	* 获取、查询栏目表数据
	*/
	public function index(){
		
		$this->display(); // 输出模板

	}


	/*
	*
	* 跳转添加或修改栏目页面
	*/
	public function add(){
		//如果是修改，则查询对应分类信息
		if (intval($_GET['cid'])) {
			$cate_id = intval($_GET['cid']);
		
			$cate_info = $this->category->where('id='.intval($cate_id))->find();
			if (!$cate_info) {
				$this->error('没有找到相关信息.');
			}
			$this->assign('cate_info',$cate_info);
		}
		$this->display();
	}


	/*
	*
	* 添加或修改栏目信息
	*/
	public function save(){
		//限制三级以上分类添加的判断
		$tid = intval($_POST['tid']);
		//获取用户选择分类的父级分类
		$tid1 = $this->category->where('id='.intval($tid))->getField('tid');
		if (intval($tid1)) {
			$tid2 = $this->category->where('id='.intval($tid1))->getField('tid');
			if (intval($tid2)) {
				$c_info = $this->category->where('id='.intval($tid2))->find();
				if ($c_info) {
					$this->error('该栏目已经是第三级分类，不可添加下级分类.');
				}
			}
		}

		//判断是否已经存在该栏目
		if (!intval($_POST['cid'])) {
			$check_id = $this->category->where('tid='.intval($tid).' AND name="'.trim($_POST['name']).'"')->getField('id');
			if (is_int($check_id)) {
				$this->error('该栏目已存在.');
			}
		}
		

		if ($tid>0 && $tid==intval($_POST['cid'])) {
			$this->error('所属栏目不能成为自己的上级.');
		}

		//构建数组
		$this->category->create();
		//上传产品分类缩略图
		if (!empty($_FILES["file2"]["tmp_name"])) {
			//文件上传
			$info2 = $this->upload_pic($_FILES["file2"],array('jpg','png','jpeg'),"category/".date(Ymd));
		    if(!is_array($info2)) {// 上传错误提示错误信息
		        $this->error($info2);
		    }else{// 上传成功 获取上传文件信息
			    $this->category->bz_1 = 'UploadFiles/'.$info2['savepath'].$info2['savename'];
		    }
		}
		//保存数据
		if (intval($_POST['cid'])) {
			$result = $this->category->where('id='.intval($_POST['cid']))->save();
		}else{
			//保存添加时间
			if (intval($_POST['tid']) == 0) {
				$this->category->bz_4 = 1;
			}
			$this->category->addtime = time();
			$result = $this->category->add();
		}
		//判断数据是否更新成功
		if ($result) {
			$this->success('操作成功.','index');
		}else{
			$this->error('操作失败.');
		}
	}


	/*
	*
	*  设置栏目推荐
	*/
	public function set_tj(){
		$tj_id = intval($_GET['tj_id']);
		$cate_info = $this->category->where('id='.intval($tj_id))->find();
		if (!$cate_info) {
			$this->error('栏目信息错误.');
		}
		$data=array();
		$data['bz_2'] = $cate_info['bz_2'] == '1' ?  0 : 1;
		$up = $this->category->where('id='.intval($tj_id))->save($data);
		if ($up) {
			$this->success('操作成功.');
		}else{
			$this->error('操作失败.');
		}
	}

	/*
	*
	* 栏目删除
	*/
	public function del(){
		//以后删除还要加权限登录判断
		$id = intval($_GET['did']);
		if (!$id) {
			$this->error('非法操作.');
		}
		//判断该分类下是否还有子分类
		$check_id = $this->category->where('tid='.intval($id))->getField('id');
		if ($check_id) {
			$this->error('该栏目下存在子栏目，请先删除子栏目！');
		}
		$res = $this->category->where('id='.intval($id))->delete();

		if ($res) {
			$this->redirect('index');
		}else{
			$this->error('操作失败.');
		}
	}

	//***************************
	//说明：分类推荐
	//***************************
	public function set_cattj() {
		$cat_id = intval($_REQUEST['cat_id']);

		$catimg = M('catimg')->where('cat_id='.intval($cat_id).' AND state=1')->find();
		$img = array();
		if ($catimg['img_str']!='') {
			$img = explode(',', trim($catimg['img_str'],','));
		}
		
		$pro = M('product')->where('id='.intval($catimg['pro_id']))->getField('name');
		$catimg['pro_name'] = $pro;

		$this->assign('img',$img);
		$this->assign('cat_id',$cat_id);
		$this->assign('catimg',$catimg);
		$this->display();
	}

	//***************************
	//说明： 保存分类推荐
	//***************************
	public function save_catpro() {
		$pro_id = intval($_POST['pro_id']);
		$cat_id = intval($_POST['cat_id']);
		if (!$pro_id || !$cat_id) {
			$this->error('参数错误！');
			exit();
		}

		//多张商品轮播图上传
		$up_arr = array();
		if (!empty($_FILES["files"]["tmp_name"])) {
			foreach ($_FILES["files"]['name'] as $k => $val) {
				$up_arr[$k]['name'] = $val;
			}

			foreach ($_FILES["files"]['type'] as $k => $val) {
				$up_arr[$k]['type'] = $val;
			}

			foreach ($_FILES["files"]['tmp_name'] as $k => $val) {
				$up_arr[$k]['tmp_name'] = $val;
			}

			foreach ($_FILES["files"]['error'] as $k => $val) {
				$up_arr[$k]['error'] = $val;
			}

			foreach ($_FILES["files"]['size'] as $k => $val) {
				$up_arr[$k]['size'] = $val;
			}
		}
			
		$adv_str = '';
		if ($up_arr) {
			$res=array();
			foreach ($up_arr as $key => $value) {
				$res = $this->upload_pic($value,array('jpg','png','jpeg'),"product/category/".date(Ymd));
				if(is_array($res)) {
					// 上传成功 获取上传文件信息保存数据库
					$adv_str .= ','.'UploadFiles/'.$res['savepath'].$res['savename'];
				}
			}
		}

		if ($adv_str=='') {
			$this->error('请至少上传一张推荐展示图！');
			exit();
		}

		$data = array();
		$data['pro_id'] = $pro_id;
		$data['cat_id'] = $cat_id;
		//执行添加
		if(intval($_POST['id'])>0){
			$imgs = M('catimg')->where('pro_id='.intval($pro_id).' AND cat_id='.intval($info['cid']).' AND state=1')->getField('img_str');
			if ($imgs!='') {
				$data['img_str'] = $imgs.$adv_str;
			}else{
				$data['img_str'] = $adv_str;
			}

			$sql = M('catimg')->where('id='.intval($_POST['id']))->save($data);
		}else{
			$data['img_str'] = $adv_str;
			$data['addtime']=time();
			$sql = M('catimg')->add($data);
		}

		if ($sql) {
			$this->success('操作成功！');
			exit();
		} else {
			$this->error('操作失败！');
			exit();
		}
		
	}

	/*
	* 单张图片删除
	*/
	public function img_del(){
		$img_url = trim($_REQUEST['img_url']);
		$id = intval($_REQUEST['id']);
		if (!$img_url || !$id) {
			echo json_encode(array('status'=>0,'err'=>'参数错误！'));
			exit();
		}

		$check_info = M('catimg')->where('id='.intval($id).' AND state=1')->find();
		if (!$check_info) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$arr = explode(',', trim($check_info['img_str'],','));
		if (in_array($img_url, $arr)) {
			foreach ($arr as $k => $v) {
				if ($img_url===$v) {
					unset($arr[$k]);
				}
			}
			$data = array();
			$data['img_str'] = implode(',', $arr);
			$res = M('catimg')->where('id='.intval($id))->save($data);
			if (!$res) {
				echo json_encode(array('status'=>0,'err'=>'操作失败！'.__LINE__));
				exit();
			}
			//删除服务器上传文件
			$url = "Data/".$img_url;
			if (file_exists($url)) {
				@unlink($url);
			}

			echo json_encode(array('status'=>1));
			exit();
		}else{
			echo json_encode(array('status'=>0,'err'=>'操作失败！'.__LINE__));
			exit();
		}
	}

	//********************************
	//说明：获取产品列表
	//********************************
	public function get_pro(){
		$cat_id = (int)$_REQUEST['cat_id'];

		//搜索变量
		$tuijian=$this->htmlentities_u8($_GET['tuijian']);
		$name=$this->htmlentities_u8($_GET['name']);

		//=================================
		// 产品列表信息 搜索
		//=================================
		$where="del=0 AND cid=".intval($cat_id);
		$tuijian!=='' ? $where.=" AND type=$tuijian" : null;
		$name!='' ? $where.=" AND name like '%$name%'" : null;
		define('rows',20);
		$count=M('product')->where($where)->count();
		$rows=ceil($count/rows);
		$page=(int)$_REQUEST['page'];
		$page<0?$page=0:'';
		$limit=$page*rows;
		$page_index=$this->page_index($count,$rows,$page);
		$productlist=M('product')->where($where)->order('addtime desc,id desc')->limit($limit,rows)->select();
		foreach ($productlist as $k => $v) {
			$productlist[$k]['cat_name']= M('category')->where('id='.intval($v['cid']))->getField('name');
		}

		//==========================
		// 将GET到的数据再输出
		//==========================
		$this->assign('tuijian',$tuijian);
		$this->assign('name',$name);
		$this->assign('page',$page);
		//=============
		// 将变量输出
		$this->assign('productlist',$productlist);
		$this->assign('page_index',$page_index);
		$this->display();
	}

	/*
	*
	* 图片上传的公共方法
	*  $file 文件数据流 $exts 文件类型 $path 子目录名称
	*/
	private function upload_pic($file,$exts,$path){
		$upload = new \Think\Upload();// 实例化上传类
		$upload->maxSize   =  2097152 ;// 设置附件上传大小2M
		$upload->exts      =  $exts;// 设置附件上传类型
		$upload->rootPath  =  './Data/UploadFiles/'; // 设置附件上传根目录
		$upload->savePath  =  ''; // 设置附件上传（子）目录
		$upload->saveName = time().mt_rand(100000,999999); //文件名称创建时间戳+随机数
		$upload->autoSub  = true; //自动使用子目录保存上传文件 默认为true
		$upload->subName  = $path; //子目录创建方式，采用数组或者字符串方式定义
		// 上传文件 
		$info = $upload->uploadOne($file);
		if(!$info) {// 上传错误提示错误信息
		    return $upload->getError();
		}else{// 上传成功 获取上传文件信息
			//return 'UploadFiles/'.$file['savepath'].$file['savename'];
			return $info;
		}
	}
}