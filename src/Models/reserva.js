export var Reserva = function(json){
    this.item = json['item'];
    this.dataFim = json['datafim'];
    this.dataInicio = json['datainicio'];
    this.usuario = json['usuario'];
    this.ativo = json['ativo'];
    this.codigo = json['cod'];
  }