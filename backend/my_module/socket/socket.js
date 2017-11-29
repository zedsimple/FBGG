exports.connectSocket = function(server,app){
	var jwt = require("jsonwebtoken");
	var io = require("socket.io")(server);
	var mongo_client = require("mongodb").MongoClient;
	var url = "mongodb://localhost:27017/data_fbgg";
	var autoIncrement = require("mongodb-autoincrement");

	var follower = require("../database/follower");
	follower.createCollection();
	var post = require("../database/post");
	post.createCollection();
	var topic = require("../database/topic");
	topic.createCollection();
	var user = require("../database/user");
	user.createCollection();
	var user_comment_post = require("../database/user_comment_post");
	user_comment_post.createCollection();
	var user_topic = require("../database/use_topic");
	user_topic.createCollection();

	

	io.on("connection",function(socket){
		console.log("connected socket: " + socket.id);
		//dang ki

		socket.on("register",function(data){
			user.find({mail: data.mail}).then(function(items) {
			  if (items.length == 0) {
			  	
			  	mongo_client.connect(url,function(err,db){
					if (err) throw err;
					autoIncrement.getNextSequence(db, "user", function (err, autoIndex) {
				        var collection = db.collection("user");
				        dt_inssert = {
				            _id: autoIndex,
				            name:data.name,
				            nickName:data.nickName,
				            mail:data.mail,
				            phone:data.phone,
				            password:data.password,
				            address:data.address,
				            ratting:0
				        };				       
				        collection.insert(dt_inssert);

				        var token = jwt.sign(dt_inssert, 'FBGGJWTToken',{
					          expiresIn: '3d' // expires in 3 day
					        });
						//server send tokken	
			  			socket.emit("register_res",{token:token});

				        console.log("inserted collection "+ "user");
				    });
				});

			  }else {
			  	socket.emit("register_res",{msg:"that_bai"});
			  }
			});
		});
		var decoded_token;
		// receiver token
		socket.on("req_send_token",function(data){
			jwt.verify(data.token,'FBGGJWTToken',function(err,decoded){
				decoded_token = decoded;
			});			
		});

		// send all post 
		socket.on("req_send_all_post",function(data){
			mongo_client.connect(url,function(err,db){
				db.collection("post").find().sort({_id:-1}).toArray(function(err, result) {
					if (err) throw err;
					console.log("send all post");
					socket.emit("server_send_all_post",result);
					db.close();
				  });
			});
		});
		//send all post about topic
		socket.on("req_send_all_post_about_topic",function(data){
			post.find({topic_name:data.topic_name}).then(function(items){
				socket.emit("server_send_all_post_about_topic",items)
			});
		});

		// send post new
		socket.on("user_send_post_new",function(data){
			post.addCollection(data);
			io.emit("new_post",data);
		});
		// send all topic

		topic.find({}).then(function(items){
			socket.emit("server_send_all_topic",items);
		});

		// topic care
		socket.on("req_send_all_topic_care",function(data){
			user_topic.find({user_id:decoded_token._id}).then(function(items){
				socket.emit("server_send_all_topic_care",items);
			});
		});

		socket.on("req_send_new_topic_care",function(data){
			user_topic.addCollection(data);
			socket.emit("server_send_new_topic_care",data);
		});
		
		// post đã đăng
		socket.on("req_send_all_my_post",function(data){
			post.find({user_id:decoded_token._id}).then(function(items){
				socket.emit("server_send_all_your_post",items)
			});
		});
	});

	io.on("disconnect",function(){
		console.log("disconnect "+ socket.id);
	});
};