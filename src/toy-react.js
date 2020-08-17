
class Component{
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
           this._root = this.render().root; // 如果render出来是个Component，会继续递归
       }
       return this._root;
    }
}

class ElementWrapper{
    constructor(type){
        this.root = document.createElement(type)
    }

    setAttribute(name, value){
        this.root.setAttribute(name, value)
    }

    appendChild(component){
        this.root.appendChild(component.root)
    }

}

class TextWrapper{
    constructor(content){
        this.root = document.createTextNode(content)
    }
}

function createElement(type, attributes, ...children){
    let e;
    if(typeof type === "string"){
        e = new ElementWrapper(type)
    }else {
        e = new type
    }
    
    for (const p in attributes) {
        if (attributes.hasOwnProperty(p)) {
            const attribute = attributes[p];
            e.setAttribute(p, attribute)
        }
    }

    const insertChildren = (children) => {
        for (let child of children) {
            if(typeof child === "string"){
                child = new TextWrapper(child)
            }
            if(typeof child === "object" && child instanceof Array){
                insertChildren(child)
            }else{
                e.appendChild(child)
            }
        }
    }
    insertChildren(children)
    return e
}

function render(component, parentElement){
    parentElement.appendChild(component.root)
}

module.exports = { createElement, render, Component }