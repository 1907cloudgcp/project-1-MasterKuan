let dbObject = {
    Name:'',
    Age:'',
    Degree:''
}

document.getElementById('header').innerText = "Revature Antarctica: Cold Storage Edition";

//this assumes your cloud function will return a value named address with the address to an image, in a cloud storage bucket
async function setUpImages(){
    let images = []
    images.push(document.getElementById('carousel-1'))
    images.push(document.getElementById('carousel-2'))
    images.push(document.getElementById('carousel-3'))
    images.forEach(async (value, index)=>{
	let bucket_url = `https://us-central1-gcpdemons.cloudfunctions.net/get-bucket-image?index=${index}`
        let response = await fetch(bucket_url)
        
    if(response.status <200 || response.status > 299){
        value.src = "images/penguins.jpg"
    } else {
        data =  await response.json()
        value.src = data["image"]
    }
    })
}
setUpImages()

document.getElementById('calc-label').innerText = "Input city to get distance from Antarctica"

document.getElementById('calc-input').type = 'text'

async function calcSubmit(event){
    event.preventDefault()
    let city = document.getElementById('calc-input').value
    let distance_url = `https://us-central1-gcpdemons.cloudfunctions.net/distance_from_antarctica?city=${city}`
    let result = await fetch(distance_url, {
        method: 'POST',
        body: JSON.stringify(document.getElementById('calc-input').value)
    })
    if(document.getElementById('calc-input').type === 'number'){
        document.getElementById('calc-input').value = 0
    } else {
        document.getElementById('calc-input').value = ''
    }
    let data = await result.json()
    let div = document.getElementById('calc-container')
    let display = document.createElement('p')
    display.innerText = data["message"]
    div.appendChild(display)
}



async function buildTable (){
    let objectResponse = await fetch("https://us-central1-gcpdemons.cloudfunctions.net/get-data")
    if(objectResponse.status <200 || objectResponse.status >299){
        let error =document.createElement('p')
        error.innerText = "Fetch Failed"
        document.getElementById('footer-table').appendChild(error)
    }else {
        let objectList = await objectResponse.json()
       
        let headRow = document.createElement('tr')
        document.getElementById('object-table-head').appendChild(headRow)
        for(key in dbObject){
            let th = document.createElement('th')
            th.innerText = key
            th.className = 'object-table-data'
            headRow.appendChild(th)
        }
        
        objectList = objectList.map((e)=>{
            let newe = {};
            for(key in dbObject){                
                newe[key] = e[key]
            }
            return newe
        })
        let tbody = document.getElementById('object-table-body')
        objectList.forEach((v)=>{
            let row = document.createElement('tr')
            tbody.appendChild(row)
            for(key in v){
                let data = document.createElement('td')
                data.innerText = v[key]
                data.className = 'object-table-data'
                row.appendChild(data)
            }
        })
        
    }
}

async function destroyTable(){
	let headRow = document.getElementById('object-table-head')
	while (headRow.firstChild){
		headRow.removeChild(headRow.firstChild)
	}
	
	let tbody = document.getElementById('object-table-body')
	while (tbody.firstChild){
		tbody.removeChild(tbody.firstChild)
	}
}

function buildForm(){
    for(key in dbObject){
        let div = document.createElement('div')
        div.className = 'form-group'
        document.getElementById('footer-form').appendChild(div)
        let form = document.createElement('input')
        form.className = 'form-control'
        if(typeof(key) === 'number'){
            form.type = 'number'
        } else{
            form.type = 'text'
        }
        form.id = `${key}id`
        let label = document.createElement('label')
        label.for = form.id
        label.innerText = key
        div.appendChild(label)
        div.appendChild(form)
    }

}

async function createObject(event){
    event.preventDefault()
    console.log(event);
    let newObj = {}
    for(key in dbObject){
        let input = document.getElementById(`${key}id`)
        newObj[key] = input.value
        if(input.type === 'number'){
            input.value = 0
        } else {
            input.value = ''
        }
    }
    
    let result = await fetch('https://us-central1-gcpdemons.cloudfunctions.net/post-data',{
        method: 'POST',
        body: JSON.stringify(newObj)
    })
	
	if(result.status <200 || result.status >299){
        alert("Error: " + result.status + "response")
    }else{
		alert("Success!")
	}
	
	await destroyTable()
	await buildTable()
}

buildTable()
buildForm()
