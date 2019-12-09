App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
		petTemplate.find('.btn-shop').attr('data-id', data[i].id);
		petTemplate.find('.btn-tr').attr('data-id', data[i].id);
		petTemplate.find('.btn-getBalances').attr('data-id', data[i].id);
        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
      
    // 判断是否有注入的web3实例
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // 如果未检测到注入的web3实例，则返回到Ganache本地私链
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {
    // 加载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
       // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // 为合约指定服务
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });


    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
	$(document).on('click', '.btn-shop', App.handleShop);
	$(document).on('click', '.btn-tr', App.handleTr);
	$(document).on('click', '.btn-getBalances', App.getBalances);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
	  console.log(adoptionInstance);

      // 调用合约的getAdopters(), 用call读取信息不用消耗gas
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    // 获取用户账号
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
	  console.log("领养用户账号：" + account);

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // 发送交易领养宠物
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  
  markShop: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
	  console.log(adoptionInstance);

      // 调用合约的getAdopters(), 用call读取信息不用消耗gas
      return adoptionInstance.show.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.btn btn-default btn-shop').text('购买成功').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },
  handleShop: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    // 获取用户账号
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
	  console.log("交易用户账号：" + account);

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
var amount = web3.toWei('1', 'ether');
        // 发送交易转账
        return adoptionInstance.shop(web3.toHex(0xAa13599f404AA9241b3aa6777052e02dac91c0C4), amount);
      }).then(function(result) {
        return App.markShop();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
	handleTr: function(event) {
		event.preventDefault();

		var petId = parseInt($(event.target).data('id'));

		var adoptionInstance;

		// 获取用户账号
		web3.eth.getAccounts(function(error, accounts) {
		  if (error) {
			console.log(error);
		  }
		  App.contracts.Adoption.deployed().then(function(instance) {
			adoptionInstance = instance;
			var amount = web3.toWei('1', 'ether');
			console.log("转账接收地址：" + '0xAa13599f404AA9241b3aa6777052e02dac91c0C4');
			// 发送交易转账
			return adoptionInstance.toAccount(accounts[0], '0xAa13599f404AA9241b3aa6777052e02dac91c0C4',amount);
		  }).then(function(result) {
			  return App.markShop();
			//console.log("结果：" + result);
			//alert("转账成功");
			//$('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
		  }).catch(function(err) {
			console.log(err.message);
		  });
		  //console.log("所有账户：" + accounts);
		  //var account0 = accounts[0];
		 // var account1 = 0xaaF4dcd514E5d2a65aCa91405f37C1c1aF67e352;
		  //console.log("交易发起用户账号：" + account0);
		  //console.log("交易接收用户账号：" + account1);
		 //var data = web3.toHex('这是一个私有链的测试交易');
		 // var txo = {
			//from: accounts[0],
			//to: accounts[1],
			//value:'1',
			//data:  data
			//};
		//web3.eth.sendTransaction(txo,  (error, hash) =>  console.log(hash));
	  });
	  
	},
	getBalances: function(event) {
		event.preventDefault();

		var petId = parseInt($(event.target).data('id'));

		var adoptionInstance;

		// 获取用户账号
		web3.eth.getAccounts(function(error, accounts) {
		  if (error) {
			console.log(error);
		  }
		  App.contracts.Adoption.deployed().then(function(instance) {
			adoptionInstance = instance;
			
			return adoptionInstance.showBalances(accounts[0]);
		  }).then(function(result) {
			console.log("结果：" + result);
			alert("查询成功");
			$('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
		  }).catch(function(err) {
			console.log(err.message);
		  });
		  //console.log("所有账户：" + accounts);
		  //var account0 = accounts[0];
		 // var account1 = 0xaaF4dcd514E5d2a65aCa91405f37C1c1aF67e352;
		  //console.log("交易发起用户账号：" + account0);
		  //console.log("交易接收用户账号：" + account1);
		 //var data = web3.toHex('这是一个私有链的测试交易');
		 // var txo = {
			//from: accounts[0],
			//to: accounts[1],
			//value:'1',
			//data:  data
			//};
		//web3.eth.sendTransaction(txo,  (error, hash) =>  console.log(hash));
	  });
	  
	}
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
