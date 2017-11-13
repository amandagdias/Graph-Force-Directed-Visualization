const PCA = require('ml-pca');
var cov = require( 'compute-covariance');
var math = require('mathjs')

var X = XLSX;
var XW = {
	/* worker message */
	msg: 'xlsx',
	/* worker scripts */
	worker: './xlsxworker.js'
};

var global_wb;

 var countries = [];  
 var ranking = [];
 var universities = [];
 var biggest = [];
//Matriz de distância que representam a grossura do link (quanto mais grosso, mais distância geograficamente os países são)
 var distances = [[0, 6830, 8011, 2262, 15290, 7667, 7861, 15184, 7554, 11647, 10150, 12699, 7506, 7666, 7823, 7488, 10743],
    [0,0, 1249, 5807, 10961, 1404, 1033, 15206, 757, 7780, 9200, 9557, 677, 1091, 1819, 813, 8858],
    [0,0,0, 7056, 10323, 1628, 510, 14695, 494, 7596, 9526, 9339, 628, 465, 2013, 1054, 9020],
    [0,0,0,0, 13068, 6214, 6751, 14152, 6563, 9386, 8083, 10490, 6454, 6841, 6246, 6255, 8579],
    [0,0,0,0,0, 9610, 10125, 4377, 10550, 3837, 5250, 2591, 10469, 10787, 9254, 10149, 4567],
    [0,0,0,0,0,0, 1119, 13806, 1390, 6379, 7975, 8156, 1210, 1883, 431, 686, 7549],
    [0,0,0,0,0,0,0, 14466, 426, 7224, 9048, 8984, 372, 816, 1512, 570, 8570],
    [0,0,0,0,0,0,0,0, 14892, 7474, 6852, 5709, 14793, 15159, 13405, 14415, 6832],
    [0,0,0,0,0,0,0,0,0, 7627, 9365, 9393, 190, 504, 1813, 722, 8921],
    [0,0,0,0,0,0,0,0,0,0, 3047, 1778, 7486, 8022, 5961, 7031, 2118],
    [0,0,0,0,0,0,0,0,0,0,0, 2787, 9185, 9850, 7553, 8655, 943],
    [0,0,0,0,0,0,0,0,0,0,0,0, 9256, 9774, 7739, 8807, 2000],
    [0,0,0,0,0,0,0,0,0,0,0,0,0, 693, 1636, 535, 8750],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0, 2298, 1224, 9384],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1116, 7118],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 8235]];
var max, min;
$(document).ready(function(){        
        var xlf = $("#xlf");       
        $("#xlf").on('change',function(e) {
            console.log("listener "  + e);
            do_file(e.target.files);           
        });  
   
    max = 0;
    min = 1000000;
    for (var i = 0; i < 16; i++){
        for (var j = 0; j < distances[i].length; j++){            
            if ((distances[i][j] > max)&&(distances[i][j]!=0)){
                max = distances[i][j];
            }
            if ((distances[i][j] < min)&&(distances[i][j]!=0)){
                min = distances[i][j];
            }
        }
    }
});
//Função chamada após a escolha do arquivo
 var process_wb = (function() {

    //Pega os valores maximos e minimos de um vetor
    Array.prototype.max = function() {
      return Math.max.apply(null, this);
    };
        Array.prototype.min = function() {
      return Math.min.apply(null, this);
    };
	var to_csv = function to_csv(workbook) {		
        var csv;
		workbook.SheetNames.forEach(function(sheetName) {
			csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
		});
        var dataCSV = [], line;        
        var i = 0;      
        var k;
        var lines;
        var j2;
        var c = 0;
        var faltantes = false;
       
        k = i+1;
        //Pega as primeiras 100 universidades
        while (k <= 101)
         {                
               dataCSV[i] = [];
               
               //Pega a linha do documento (começa na linha 1 para pular o cabeçalho)
               line = csv.split('\n')[k];
               k++;
               j2 = 0;
               //Pega cada coluna do documento separando por vírgulas
               for (j=0; j < line.split(',').length; j++)
               {
                   //Pula as duas primeiras colunas pois são nomes de países e universidades e a coluna 8 pois tem muitos dados faltantes
                   if ((j > 2)&&(j!=8)){                    
                       if ((line.split(',')[j] == "")||(line.split(',')[j] == "-")){
                           //dados faltantes, neste caso utilizarei o -1 como valor que representa dados faltantes
                           dataCSV[i][j2] = -1.0; 
                           j2++;
                       }                        
                       else{
                           dataCSV[i][j2] = parseFloat(line.split(',')[j]);                             
                           j2++;
                       }                            
                   }else if (j===2){                       
                       countries[c] = line.split(',')[j];
                       
                       if (+line.split(',')[0]){
                          //Salvo o ranking de cada universidade e os maiores rankings são salvos para posteriormente serem os hubs do grafo
                          ranking[c] = +line.split(',')[0]; 
                          if (biggest[countries[c]] == null){
                              console.log(countries[c] + " " + c);
                              biggest[countries[c]] = c;
                          }
                       }
                       else{
                          ranking[c] = -1; 
                       }
                       universities[c] = line.split(',')[1] 
                       c++;
                   }                                 
               }
               if (faltantes == false)
               {
                   i++;                    
                   
               }else{
                   faltantes = false;                                     
               }                
           }    
     
        lines = i;     
//Começo a criar o arquivo JSON que será lido pelo D3
        var nodes = '{ "nodes": [ ';
        
        for (i=0; i < lines; i++){
            nodes += '{"rank": ' + ranking[i] +',';
            nodes += '"id": "' + universities[i] +'",';
            nodes += '"country": "' + countries[i] +'",';
            
            for (j=0; j < j2; j++){
                if (j==5){
                   nodes += '"num_students": ' + dataCSV[i][j] +','; 
                }else
                    if (j==7){
                        nodes += '"inter_students": ' + dataCSV[i][j] +','; 
                    }else if (j==8){
                        
                            nodes += '"female_students": ' + dataCSV[i][j] +'}'; 
                        
                    }
                
            }
            if ((i + 1) < lines){
               nodes += ','; 
            }
        }    
        nodes+='],';
        var uniA;
        var uniB;
        var links = '"links": [ ';
        for (var k in biggest) {  
            uniA = k;
            for (j=0; j < lines; j++){
                uniB = countries[j];                
                //Se as universidades forem do mesmo país, eu linko com grossura do link = 2
                if ((uniA == uniB)&&(universities[j] != universities[biggest[k]])){
                    links +=' {"source": "' + biggest[k] + '", "target" : "' + j + '", "value":'+2+'}';
                    links+=',';    
                }
                
            }
        }     
//Seleciono os ids das universidades com maiores rankings e crio links entre elas
        var biggest_id = [];
        i = 0;
        for (var k in biggest) {   
            if (biggest.hasOwnProperty(k)){
              biggest_id[i] = biggest[k];         
              i++;
            }
        }
        for (i= 0; i < (biggest_id.length - 1); i++){
            for (j=(i+1); j < biggest_id.length; j++){
                links+= ' {"source": "' + biggest_id[i] + '", "target" : "' + biggest_id[j] + '", "value":'+CalcGrossuraLink(i,j)+'},';
            }
        }      
        links = links.slice(0,-1);
        links += '] }';
        
//Concluindo o arquivo JSON e enviando para o arquivo visualization.js 
        var obj = JSON.parse(nodes+" " +links);
       
        sendingJSON(obj);
      
	};
	return function process_wb(wb) {
		global_wb = wb;
		var output = "";       
        to_csv(wb);
	};
})();
function CalcGrossuraLink(a, b){    
    var value = ((distances[a][b] - min) / (max - min)) * 15 + 1;
    console.log(a+" " + b + " " + Math.round(value));
    return Math.round(value);
    
}
//Função que lê o arquivo selecionado
var do_file = (function() {
    
	var rABS = typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString;
	var xw = function xw(data, cb) {
		var worker = new Worker(XW.worker);
		worker.onmessage = function(e) {
			switch(e.data.t) {
				case 'ready': break;
				case 'e': console.error(e.data.d); break;
				case XW.msg: cb(JSON.parse(e.data.d)); break;
			}
		};
		worker.postMessage({d:data,b:rABS?'binary':'array'});
	};

	return function do_file(files) {
      
		var f = files[0];
        
		var reader = new FileReader();
		reader.onload = function(e) {
			var data = e.target.result;
			if(!rABS) data = new Uint8Array(data);
           
			process_wb(X.read(data, {type: rABS ? 'binary' : 'array'}));
		};
		if(rABS) reader.readAsBinaryString(f);
		else reader.readAsArrayBuffer(f);
	};
})();



