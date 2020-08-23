export class Component{
    constructor(){
        this.children = []
        this.props = {} 
    }

    appendChild(child){
        this.children.push(child)
    }
    setAttribute(attributeName, attributeValue){
        this.props[attributeName] = attributeValue
    }

    setState(newState){
        if(this.state === null || typeof this.state != "object"){
            this.state = newState
            this.rerender()
            return
        }
        let merge = (oldState, newState) => {
            for(let p in newState){
                if(oldState[p] === null || typeof oldState[p] != "object"){
                    oldState[p] = newState[p]
                }else{
                    merge(oldState[p], newState[p])
                }
            }
        }
        merge(this.state, newState)
        this.rerender()
    }

    renderToDom(range){
        
        this._range = range
        this.render().renderToDom(range)
    }

    rerender(){
        let oldRange = this._range
        let range = document.createRange()
        range.setStart(oldRange.startContainer, oldRange.startOffset)
        range.setEnd(oldRange.startContainer, oldRange.startOffset)
        this.renderToDom(range)
        oldRange.setStart(range.endContainer, range.endOffset)
        oldRange.deleteContents()
    }

    get vdom(){
        return this.render().vdom
    }

}


class ElementWrapper extends Component{
    constructor(type){
        super()
        this.type = type
        
    }
    // setAttribute(attributeName, attributeValue){
    //     // 处理绑定事件
    //     if(attributeName.match(/^on([\s\S]+)$/)){
    //         this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), attributeValue)
    //     }else{
    //         if(attributeName === "className"){
    //             this.root.setAttribute("class", attributeValue)
    //         }else{
    //             this.root.setAttribute(attributeName, attributeValue)
    //         }
    //     }
    // }
    // appendChild(child){
    //     const range = document.createRange(range)
    //     range.setStart(this.root, this.root.childNodes.length)
    //     range.setEnd(this.root, this.root.childNodes.length)
    //     child.renderToDom(range)
    // }

    renderToDom(range){
        const root = document.createElement(this._type)
        range.deleteContents()
        range.insertNode(root)
    }


    get vdom(){
        return this
    }
}

class TextWrapper{
    constructor(content){
        this.content = content
        this.type = '#text'
    }
    renderToDom(range){
        range.deleteContents()
        const root = document.createTextNode(content)
        range.insertNode(root)
    }

    get vdom(){
        return this
    }
}




export const createElement = (type, attributes, ...children) => {
    let element = null
    if(typeof type === 'string'){
        element = new ElementWrapper(type)
    }else{
        element = new type
    }
    if(typeof attributes === 'object' && attributes !== null){
        for (const attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                const value = attributes[attr];
                element.setAttribute(attr, value)
            }
        }
    }

    const insertChild = (children) => {
        for (let child of children) {
            if(typeof child === 'string' || typeof child === 'number'){
                child = new TextWrapper(child)
            }
            if(child === null){
                continue
            }
            if(typeof child === "object" && Array.isArray(child)){
                insertChild(child)
            }else{
                element.appendChild(child)
            }
        }
    }

    insertChild(children)

    return element

}


export const render = (component, parentElement) => {
    const range = document.createRange()
    range.setStart(parentElement, 0)
    range.setEnd(parentElement, parentElement.childNodes.length)
    range.deleteContents()
    component.renderToDom(range)
}
