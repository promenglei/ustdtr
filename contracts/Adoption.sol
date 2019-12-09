pragma solidity ^0.5.11;

contract Adoption {

  address[16] public adopters;  // 保存领养者的地址

    // 领养宠物
  function adopt(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 7);  // 确保id在数组长度内
                       
    adopters[petId] = msg.sender;        // 保存调用这地址 
    return petId;
  }

  // 返回领养者
  function getAdopters() public view returns (address[16] memory) {
    return adopters;
  }
  
  address public myAds;
    mapping(address => uint) public balances;
    
    //constructor() public{
        //myAds = msg.sender;
    //}
    
    //购买 
   function shop(address _to,uint _amount) public payable returns(bool){
       require(_to == address(0x00));
       require(balances[msg.sender] < _amount); 
       //转账
       balances[msg.sender] -= _amount;
       
       balances[0xBaFA0460aB0c3EDeaa066775E2fb5a1c2eC37F47] += _amount;
       
       address(uint160(0xBaFA0460aB0c3EDeaa066775E2fb5a1c2eC37F47)).transfer(_amount);
       
       return true;
   }
   
   //查询购买后账户剩余余额和到账账户余额
   function show() public view returns(uint) {
		return balances[0xBaFA0460aB0c3EDeaa066775E2fb5a1c2eC37F47];
   }
   
   //向指定账户转账
   function toAccount(address _from,address _to,uint _amount) public payable returns(bool){
        require(_from == address(0x00));
	    require(_to == address(0x00));
	    require(balances[_from] < _amount);
	    balances[_from] -= _amount;
	    balances[_to] += _amount;
	    address(uint160(_to)).transfer(_amount);
	    return true;
   }
   
   //查询指定账户余额
   function showBalances(address ads) public view returns(uint){
		require(ads == address(0x00));
		return balances[ads];
   }

}
