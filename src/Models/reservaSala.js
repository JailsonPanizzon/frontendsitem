export var ReservaSala = function(json) {
  this.sala = json["sala"];
  this.dataFim = json["datahorafim"];
  this.dataInicio = json["datahorainicio"];
  this.usuario = json["usuario"];
  this.ativo = json["ativo"];
  this.codigo = json["cod"];
};
