const PCA = require('ml-pca');
var cov = require( 'compute-covariance' );
var math = require('mathjs')

var X = XLSX;
var XW = {
	/* worker message */
	msg: 'xlsx',
	/* worker scripts */
	worker: './xlsxworker.js'
};

var global_wb;
$(document).ready(function(){        
        var xlf = $("#xlf");       
        $("#xlf").on('change',function(e) {
            console.log("listener "  + e);
            do_file(e.target.files);           
        });
    var x = document.getElementById("n_alunos");
    x.checked = true;
});
//Para pegar uma coluna da matriz (para calcular a covariancia)
function getCol(matrix, col){
           var column = [];
           for(var i=0; i<matrix.length; i++){
              column.push(matrix[i][col]);
           }
           return column;
}
//Calcula a matriz transposta
function transpose(a)
{
  return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });  
}
//Faz a multiplicação entre duas matrizes
function multiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}
//Função chamada após a escolha do arquivo
 var process_wb = (function() {
//	var OUT = $("#out");
//	var HTMLOUT = $("#htmlout");
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
        var countries = [];  
        var ranking = [];
        var universities = [];
        k = i+1;
        //Roda enquanto tiver linhas 
//         while (csv.split('\n')[k])
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
                           //dados faltantes, pular linha
                           dataCSV[i][j2] = -1.0; 
                           j2++;
//                           faltantes = true; 
//                           c--;
//                           break;
                       }                        
                       else{
                           dataCSV[i][j2] = parseFloat(line.split(',')[j]);                             
                           j2++;
                       }                            
                   }else if (j===2){                       
                       countries[c] = line.split(',')[j];   
                       ranking[c] = +line.split(',')[0]; 
//                       if (+line.split(',')[0] <= 10)
//                       {
//                           ranking[c] = "#00BFFF";
//                       }
//                       else if ((+line.split(',')[0] > 10)&&(+line.split(',')[0] <= 100)){
//                           ranking[c] = "#FF8C00";
//                       }
//                       else{
//                           ranking[c] = "#FF0000";
//                       }
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
//        console.log(nodes);
        var uniA;
        var uniB;
        var links = '"links": [ ';
        for (i = 0 ; i < (lines-1); i++){
            uniA = countries[i];
            for (j=(i+1); j < lines; j++){
                uniB = countries[j];
                //Se as universidades forem do mesmo país, eu linko com força 1
                if (uniA == uniB){
                    links +=' {"source": "' + i + '", "target" : "' + j + '", "value":'+1+'}';
//                    if ((i + 1) < (lines-1))
                    links+=',';    
                }
                
//                }else{
//                   links +=' {"source": "' + i + '", "target" : "' + j + '", "value":'+10+'}'
//                    if ((i + 1) < (lines-1))
//                        links+=','; 
//                }
                
            }
        }
//        links = links.slice(0, -1);
        var biggest = [18,72,45,34,41,28,13,25,61,81,84,42,80,76,58,30,53];
        for (i= 0; i < (biggest.length - 1); i++){
            for (j=(i+1); j < biggest.length; j++){
                links+= ' {"source": "' + biggest[i] + '", "target" : "' + biggest[j] + '", "value":'+2+'},';
            }
        }      
        links = links.slice(0,-1);
        links += '] }';
        
        var obj = JSON.parse(nodes+" " +links);
        sendingJSON(obj);
      
	};
	return function process_wb(wb) {
		global_wb = wb;
		var output = "";       
        to_csv(wb);
	};
})();
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



