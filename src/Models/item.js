export var Item = function(json){
  this.tipoitem = json['tipoitem'];
  this.descricao = json['descricao'];
  this.dataCadastro = json['datacadastro'];
  this.marca = json['marca'];
  this.ativo = json['ativo'];
  this.codigo = json['cod'];
}

// var Item = function(descricao,tipoItem,dataCadastro,marca = null,ativo = true){
//     this.descricao = descricao;
//     this.tipoItem = tipoItem;
//     this.dataCadastro = dataCadastro;
//     this.marca = marca;
//     this.ativo = ativo;

// }

