let objectDetector;
let status;
let objects = [];
let canvas, ctx1;
let inputimg;
let trueObj=2;
let M_IMG=[];
let Marvin_image;
let url="media/car1.JPG";
let img_width;
let img_height;



function make() {

    $("#status").text("Loading Coco-ssd model...");
    objectDetector = ml5.objectDetector('', modelReady);
    inputimg = new Image();
    inputimg.onload = function() {
        img_width=this.width;
        img_height=this.height;       
        // createCanvas(0,this.width, this.height);
        // let ctx0 = document.getElementById("canvas0").getContext('2d');
        // _draw(ctx0,inputimg,"Input Image",100);
   
    }
    inputimg.src = url;

    Marvin_image = new MarvinImage();
    Marvin_image.load(url, function(){make_MarvinJ_IMG();});
    
}

// when the dom is loaded, call make();
window.addEventListener('DOMContentLoaded', function() {
    make();
    handleDetect();
});


function handleDetect()
{
    $("#go").on("click touchend",function(){
        objectDetector.detect(inputimg, gotResult);
    });
   
}

function modelReady() {
    console.log("model Ready!"); 
    $("#status").text("Coco-ssd model ready");
  }

  function gotResult(err, results) {
    if (err) {
      console.log(err);
    }
    console.log(results)
    objects = results;
    if(objects){
       handleRecog();
        
      }
}


function _draw(ctx,img,text,width,border=0){

    ctx.drawImage(img, 0, 0,img.width,img.height);

    if(border==1)
    for (let i = 0; i < objects.length; i++) {
      ctx.beginPath();
      ctx.rect(objects[i].x , objects[i].y , objects[i].width , objects[i].height );
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.closePath();
    }

    ctx.fillStyle = "#000000"
    ctx.fillRect(0,img.height-45, width, 40);
    ctx.font = "32px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(text, 0, img.height-10); 
    
}


function createCanvas(id,w, h){
    w+=10;
let canvas='<canvas class="column" id="canvas'+id+'" width="'+w+'" height="'+h+'"></canvas>'
$('#layout').append(canvas);
}

function handleRecog(){
    ////////COCO-SSD Blind Detection///////
    createCanvas(1,inputimg.width, inputimg.height);
    ctx1 = document.getElementById("canvas1").getContext('2d');
    _draw(ctx1,inputimg,"COCO-SSD vehicle detection",460,1);

    
    ///////COCO-SSD Confidence >80%  /////////
    let temp_img=Marvin_image;
    let temp_obj=objects;
    make_MarvinJ_IMG(temp_img,temp_obj);

    //////Detect Text Area          /////////
    DetectTextArea();
    
}

function make_MarvinJ_IMG(img=null,obj=null)
{
    if(img==null&&obj==null)
    {
        
    createCanvas(trueObj,img_width, img_height);
    ctx = document.getElementById("canvas"+String(trueObj++)); 
    Marvin_image.draw(ctx);
    }
    else{
        for(let i of obj)
            if(i.confidence>0.8)
            {

                let x=parseInt(i.x),y=parseInt(i.y),w=parseInt(i.width),h=parseInt(i.height);

                createCanvas(trueObj,img_width, img_height);
                ctx = document.getElementById("canvas"+String(trueObj++)); 

                let _img= new MarvinImage();

                if(x<0){w+=x;x=0;}

                if(y<0){h+=y;y=0;}
      
                Marvin.crop(img, _img,x,y,w,h);
                M_IMG.push(_img);

                _img.draw(ctx);
                drawLabel(ctx,img.getHeight(),"Car Confidence >80%",200);
                // _img.setDimension(img.getWidth(), img.getHeight());

            }



    }
}

function drawLabel(ctx,imgheight,text,width)
{
    ctx=ctx.getContext('2d');
    ctx.fillStyle = "#000000"
    ctx.fillRect(0,imgheight-25, width, 20);
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(text, 0, imgheight-10); 
}

function DetectTextArea()
{
    for(let img of M_IMG)
    {
        createCanvas(trueObj,img_width, img_height);
        ctx = document.getElementById("canvas"+String(trueObj++)); 
        let _img=img.clone();
        //pre-processing
        Marvin.blackAndWhite(img, img, 90);
        // Marvin.invertColors(img, img);
        Marvin.thresholding(img, img,70, 3000);

        img.draw(ctx);
        drawLabel(ctx,img.getHeight(),"Pre-processing",200);

        //Text-Area-detection
        createCanvas(trueObj,img_width, img_height);
        ctx = document.getElementById("canvas"+String(trueObj++)); 

       
 
        var segments = Marvin.findTextRegions(img, 50, 8, 60, 150); 
        index=drawSegments(segments, img); 
        img.draw(ctx); 
        drawLabel(ctx,img.getHeight(),"Detected Text pattern",400);
        //Number plate approx text Area
       let k=0;
        for(let i of index)
        {
            // if(k==0)
            // {
            //     k=1;
            //     continue;
            // }
            createCanvas(trueObj,img_width, img_height);
            ctx = document.getElementById("canvas"+String(trueObj++)); 
            
            let seg = segments[i]; 
            let IMG_out=new MarvinImage();
            Marvin.crop(_img, IMG_out,seg.x1,seg.y1,seg.width,seg.height);

            Marvin.thresholding(IMG_out, IMG_out,100, 500);
            IMG_out.draw(ctx,0,100);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
$("#status1").text("OCR status: Loading Tesseract OCR");
                Tesseract.recognize(
                ctx,
                'eng',
              ).then(({ data: { text } }) => {
                  $("#status1").text("Detected Text:"+text);
                console.log(text);
              });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// var dataurl=ctx.toDataURL
// // console.log(dataurl);
// var formData = new FormData();
// formData.append("base64Image", dataurl);
// formData.append("language"   , "eng");
// formData.append("apikey"  , "41ea36ae9a88957");
// //Send OCR Parsing request asynchronously
// $.ajax({
//     url: " https://api.ocr.space/parse/image",
//     data: formData,
//     dataType: 'json',
//     cache: false,
//     contentType: false,
//     processData: false,
//     type: 'POST',
//     success: function (ocrParsedResult) {
//     var parsedResults = ocrParsedResult["ParsedResults"];
//     console.log("done");
//     console.log(ocrParsedResult);
//     if (parsedResults!= null) {
//             var parsedText = parsedResults["ParsedText"];
//             console.log(parsedText);
//         }
    
//     }
// });


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            drawLabel(ctx,img.getHeight(),"Number Plate approx- ready for OCR",400);
            
            let imageData = ctx.getContext("2d").getImageData(0, 100, IMG_out.getWidth(), IMG_out.getHeight());
            console.log(imageData);
            customOCR(imageData);
         // for custom   OCR
         //  customOCR(IMG_out);
        }

    }
}


function customOCR(img)
{
   let dat=[]; 
   let data=img.data;
    for (var y = 0; y < img.height; y++) {
        let _y=[];
        for (var x = 0; x < img.width; x++) {
              var index = (x + y * img.width)*4;
              let _x=[];      
                         
              _x.push(data[index+0]) ;
              _x.push(data[index+1]) ;
              _x.push(data[index+2]) ;
              _x.push(data[index+3]) ;
              _y.push(_x); 
        }    
        dat.push(_y);         
    }
let v_net=dat.length;

let histogram={"x":[],"y":[]};
for(let x=0;x<dat[0].length; x++)
{

    let avg=0;
    for(let y=0;y<dat.length; y++)
        {
            avg+=dat[y][x][0]; 
        }
    histogram.x.push(x);
    histogram.y.push(avg/v_net);
    
}  

let canvas='<div class="column1" width="500" height="500"><canvas id="graph0"></canvas></div>'
$('#layout').append(canvas);
drawGraph(histogram,"0");

///Character break  detection
let breakPoint={"x":[],"y":[]};
let flag=0;
let j=0;
previ=0;
for(i of histogram.y)
{
    breakPoint.x.push(j++);
    if(i>250)
    {
         breakPoint.y.push(10); 
            
    }
    else
    {
        // if(previ>250&&i!=previ)
        // breakPoint.y.push(10);
        // else
        breakPoint.y.push(0);         
    }
    previ=i;
}

canvas='<div class="column1" width="500" height="500"><canvas id="graph1"></canvas></div>'
$('#layout').append(canvas);
drawGraph(breakPoint,"1");


}



function drawGraph(dat,id)
{
var ctx = document.getElementById('graph'+id).getContext('2d');
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels:dat.x,
        datasets: [{
            label: 'OCR histogram',
            borderColor: 'rgb(255, 99, 132)',
            data: dat.y
        }]
    },
    options: {}
});
}

function drawSegments(segments, image){ 
    let index=[];
    for(var i in segments){ 
		var seg = segments[i];
    // Skip segments that are too small
		if(seg.width>5){ 
			image.drawRect(seg.x1, seg.y1-5, seg.width, seg.height+10, 0xFFFF0000); 
            image.drawRect(seg.x1+1, seg.y1-4, seg.width-2, seg.height+8, 0xFFFF0000); 
            if(seg.width>image.getWidth()/3&&seg.y1>image.getHeight()/3)
                index.push(i);
                
		} 
    } 
    return index;
} 

