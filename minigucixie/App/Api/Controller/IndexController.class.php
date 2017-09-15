<?php
namespace Api\Controller;
use Think\Controller;
class IndexController extends PublicController {
	//***************************
	//  首页数据接口
	//***************************
    public function index(){
        //======================
        //首页 获取logo
        //======================
        $logo = M('program')->where('id=1')->getField('logo');
        if ($logo) {
           $logo = __DATAURL__.$logo;
        }

        $ggtop=M('guanggao')->order('sort desc,id asc')->field('photo')->limit(10)->select();
        foreach ($ggtop as $k => $v) {
            $ggtop[$k]['photo']=__DATAURL__.$v['photo'];
        }
        /***********获取首页顶部轮播图 end************/

        //======================
        //首页 获取视频
        //======================
        $info = M('web')->where('id=3')->find();
        if ($info['photo']) {
            $info['photo'] = __DATAURL__.$info['photo'];
        }

        if ($info['ename']) {
            $info['vedio'] = __DATAURL__.$info['ename'];
        } else {
            $info['vedio'] = __DATAURL__.$info['linkurl'];
        }


        //======================
        //首页 热推产品4个
        //======================
        $pro = M('indexpro')->where('state=1')->order('sort asc,addtime desc')->select();
        foreach ($pro as $k => $v) {
            $photo = M('product')->where('id='.intval($v['pro_id']))->getField('photo_d');
            $pro[$k]['cid'] = intval(M('product')->where('id='.intval($v['pro_id']))->getField('cid'));
            $pro[$k]['photo'] = __DATAURL__.$photo;
        }

        //======================
        //首页前四个分类
        //======================
        $first = M('indeximg')->where('1=1')->order('sort asc')->limit(4)->select();
        foreach ($first as $k => $v) {
            $first[$k]['imgs'] = __DATAURL__.$v['photo'];
        }

    	//======================
    	//首页 推荐产品8个
    	//======================
    	$prolist = M('product')->where('del=0 AND is_down=0 AND type=1')->order('sort asc,addtime desc')->field('id,name,price_yh,price,photo_x,num,is_show,is_hot')->limit(8)->select();
    	foreach ($prolist as $k => $v) {
    		$prolist[$k]['photo_x'] = __DATAURL__.$v['photo_x'];
    	}

        //======================
        //首页推荐抢购产品
        //======================
        $qiang = M('product')->where('del=0 AND pro_type=2 AND is_down=0 AND type=1')->order('sort desc,id desc')->field('id,name,photo_x,price_yh,shiyong,price')->select();
        foreach ($qiang as $k => $v) {
            $qiang[$k]['photo_x'] = __DATAURL__.$v['photo_x'];
        }
        $uid = intval($_REQUEST['uid']);

    	echo json_encode(array('logo'=>$logo,'info'=>$info,'pro'=>$pro,'prolist'=>$prolist,'ggtop'=>$ggtop,'first'=>$first,'qiang'=>$qiang));
    	exit();
    }

    //***************************
    //  首页产品 分页
    //***************************
    public function getlist(){
        $page = intval($_REQUEST['page']);
        if (!$page) {
            $page=2;
        }
        $limit = intval($page*8)-8;

        $pro_list = M('product')->where('del=0 AND is_down=0 AND type=1')->order('sort asc,addtime desc')->field('id,name,price_yh,price,photo_x,num,is_show,is_hot')->limit($limit.',8')->select();
        foreach ($pro_list as $k => $v) {
            $pro_list[$k]['photo_x'] = __DATAURL__.$v['photo_x'];
        }

        echo json_encode(array('prolist'=>$pro_list));
        exit();
    }

    public function getcode(){
        $str = null;
        $strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        $max = strlen($strPol)-1;

        for($i=0;$i<32;$i++){
            $str.=$strPol[rand(0,$max)];//rand($min,$max)生成介于min和max两个数之间的一个随机整数
        }

        echo json_encode(array('status'=>'OK','code'=>$str));
        exit();
    }

}