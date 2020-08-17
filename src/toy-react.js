export class Component{
    constructor(){
        this.props = Object.create(null)
        this._root = null
        this.children = []
    }

    setAttribute(name, value){
        this.props[name] = value
    }

    appendChild(component){
        this.children.push(component)
    }

    get root(){
        if(!this._root){
            this._root = this.render().root // 如果render出来是个Component，会继续递归
        }
        return this._root
    }
}

class ElementWrapper{

    constructor(type){
        this.root = document.createElement(type)
    }

    setAttribute(attributeName, attribute){
        this.root.setAttribute(attributeName, attribute)
    }

    appendChild(child){
        this.root.appendChild(child.root)
    }
}

class TextNodeWrapper{
    constructor(type){
        this.root = document.createTextNode(type)
    }
}


export function createElement(type, attributes, ...children){
    let element = null
    if(typeof type === "string"){
        element = new ElementWrapper(type)
    }else{
        element = new type
    }
    if(typeof attributes === "object" && attributes != null){
        for (const attributeName in attributes) {
            if (attributes.hasOwnProperty(attributeName)) {
                const attribute = attributes[attributeName];
                element.setAttribute(attributeName, attribute)
            }
        }
    }

    function insertChildren(children){
        for (let child of children) {
            if(typeof child === "string"){
                child = new TextNodeWrapper(child)
            }
            if(typeof child === "object" && child instanceof Array){
                insertChildren(child)
            }else{
                element.appendChild(child)
            }
           
        }
    }
    insertChildren(children)
    return element
}

export function render(component, parentElement){
    parentElement.appendChild(component.root)
}