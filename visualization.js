 var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
var jsonFile; 
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
      return d.index;
    }).distance(80))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))

var node;
  function JSONReady(){
//Recebe o arquivo JSON da main.js
        var graph = jsonFile;        
        var link = svg.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(graph.links)
          .enter().append("line")
          .attr("stroke-width", function(d) {
            return Math.sqrt(d.value);
          });
//Cria os nós que são representados pelas bandeiras de cada país
        node = svg.append("g")
          .attr("class", "nodes")
          .selectAll("image")
          .data(graph.nodes)
          .enter().append("image")
          .attr("xlink:href", function(d){
                    return "img/" + d.country + ".png";
                })
          .attr("x", -8)
          .attr("y", -8)
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        
//Adiciono um título ao nó e o texto será substituido pelo nome da universidade e o filtro selecionado
        node.append("title")
          .text(function(d) {
            return d.id +" " +  d.rank;
          });
//Chamo a função que irá aplicar o filtro selecionado
        filter();
        simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

        simulation.force("link")
          .links(graph.links);

        function ticked() {
          link
            .attr("x1", function(d) {
              return d.source.x;
            })
            .attr("y1", function(d) {
              return d.source.y;
            })
            .attr("x2", function(d) {
              return d.target.x;
            })
            .attr("y2", function(d) {
              return d.target.y;
            });

          node
            .attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";

            })

        }
  }
  
  function filter(){    
//Verifico qual é o filtro seleciono e altero o tamanho e o título
      if (node){
          if (document.getElementById('n_alunos').checked){
             node
             .attr("width", function(d){
                  if ((60 * d.num_students / 66198) > 0)
                    return (60 * d.num_students / 66198);
                 else 
                    return 5;
             })
              .attr("height", function(d){
                 if ((60 * d.num_students / 66198) > 0)
                    return (60 * d.num_students / 66198);
                 else 
                    return 5;
             })
             .select("title")
                  .text(function(d) {
                    return d.id +" " +  d.num_students;
              });
          }else if (document.getElementById('ranking').checked){
             node
             .attr("width", function(d){
                  if ((60 - d.rank * 0.69) > 0){
                      return (60 - d.rank * 0.69);                      
                  }                   
                  else 
                    return 5;
             })
              .attr("height", function(d){
                  if ((60 - d.rank * 0.69) > 0){
                      return (60 - d.rank * 0.69);                      
                  }    
                    return 5; 
             })
             .select("title")
                 .text(function(d) {
                    return d.id +" " +  d.rank;
                 });      
          }else if (document.getElementById('international').checked){
              node
             .attr("width", function(d){
                  if ((60 * d.inter_students / 54) > 0)
                    return (60 * d.inter_students / 54);
                 else 
                    return 5;
             })
              .attr("height", function(d){
                 if ((60 * d.inter_students / 54) > 0)
                    return (60 * d.inter_students / 54);
                 else 
                    return 5; 
             })
             .select("title")
                 .text(function(d) {
                    return d.id +" " +  d.inter_students;
                 });      
          }else if (document.getElementById('female').checked){
              node
             .attr("width", function(d){
                  if ((60 * d.female_students / 70) > 0)
                    return (60 * d.female_students / 70);
                 else 
                    return 5;
             })
              .attr("height", function(d){
                 if ((60 * d.female_students / 70) > 0)
                    return (60 * d.female_students / 70);
                 else 
                    return 5; 
             })
             .select("title")
                 .text(function(d) {
                    return d.id +" " +  d.female_students;
                 });      
          }  
      }
  }
      
     
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  function sendingJSON(json){     
      jsonFile = json;
      JSONReady();
      
  }