const RENDER_TO_DOM = Symbol('render to dom')
class Component{
    constructor(){
        this.props = Object.create(null)
        this._root = null
        this.children = []
        this._range = null
    }

    setAttribute(name, value){
        this.props[name] = value
    }

    appendChild(component){
        this.children.push(component)
    }

    [RENDER_TO_DOM](range){
        this._range = range
        // 保存旧的vdom
        this._vdom = this.vdom
        // 触发子元素的createElement
        this._vdom[RENDER_TO_DOM](range)
    }

    setState(newState){
        if(this.state === null || typeof this.state != "object"){
            this.state= newState
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
        this.update()
    }

    get vdom(){
        return this.render().vdom // 递归调用
    }

    // get vchildren(){
    //     return this.children.map(c => c.vdom)
    // }

    update(){
        let isSameNode = (oldNode, newNode) => {
            if(oldNode.type !== newNode.type){
                return false
            }
            for(let name in newNode.props){
                if(newNode.props[name] !== oldNode.props[name]){
                    return false
                }
            }
            if(Object.keys(oldNode.props) > Object.keys(newNode.props)){
                return false
            }
            if(newNode.type === '#text'){
                if(newNode.type !== oldNode.type){
                    return false
                }
            }
            return true
        }
        let update = (oldNode, newNode) => {
            // type, props, children
            // #text content
            // 如果新旧结点不是相同的结点，则直接将oldNode进行覆盖
            if(!isSameNode(oldNode, newNode)){
                newNode[RENDER_TO_DOM](oldNode._range)
                return
            }
            // 如果新旧结点一样，就会把oldNode的range设置为newNode的range
            newNode._range = oldNode._range

            let newChildren = newNode.vchildren
            let oldChildren = oldNode.vchildren
            if(!newChildren || !newChildren.length){
                return
            }

            let tailRange = oldChildren[oldChildren.length - 1]._range

            for(let i=0; i < newChildren.length; i++){
                let newChild = newChildren[i]
                let oldChild = oldChildren[i]
                // newChildren的length可能会大于oldChildren的length
                if(i < oldChildren.length){
                    update(oldChild, newChild)
                }else{
                    let range = document.createRange()
                    range.setStart(tailRange.endContainer, tailRange.endOffset)
                    range.setEnd(tailRange.endContainer, tailRange.endOffset)
                    newChild[RENDER_TO_DOM](range)
                    tailRange = range
                }
            }

        }
        let vdom = this.vdom
        update(this._vdom, vdom)
        this._vdom = vdom
    }

    // rerender(){
    //     let oldRange = this._range

    //     let range = document.createRange()
    //     range.setStart(oldRange.startContainer, oldRange.startOffset)
    //     range.setEnd(oldRange.startContainer, oldRange.startOffset)
    //     this[RENDER_TO_DOM](range)

    //     oldRange.setStart(range.endContainer, range.endOffset)
    //     oldRange.deleteContents()
    // }
}

class ElementWrapper extends Component{
    constructor(type){
        super(type)
        this.type = type
    }

    get vdom(){
        // return {
        //     type: this.type,
        //     props: this.props,
        //     children: this.children.map(c => c.vdom) // 递归
        // }
        this.vchildren = this.children.map(child => child.vdom)
        return this
    }

    [RENDER_TO_DOM](range){
        this._range = range
        let root = document.createElement(this.type)
        for(let name in this.props){
            let value = this.props[name]
            if(name.match(/^on([\s\S]+)$/)){
                root.addEventListener( RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
            }else{
                if(name === "className"){
                    root.setAttribute("class", value)
                }else{
                    root.setAttribute(name, value)
                }
            }
        }

        if(this.vchildren){
            this.vchildren = this.children.map(child => child.vdom)
        }

        for(let child of this.vchildren){
            let childRange = document.createRange()
            childRange.setStart(root, root.childNodes.length)
            childRange.setEnd(root, root.childNodes.length)
            child[RENDER_TO_DOM](childRange)
        }
        replaceContent(range, root)
    }

}

class TextWrapper extends Component{
    constructor(content){
        super(content)
        this.content = content
        this.type = '#text'
    }

    [RENDER_TO_DOM](range){
        this._range = range
        let root = document.createTextNode(this.content)
        replaceContent(range, root)
    }
    get vdom(){
        // return {
        //     type: '#text',
        //     content: this.content
        // }
        return this
    }
}

function replaceContent(range, node){
    range.insertNode(node);
    range.setStartAfter(node)
    range.deleteContents()
    range.setStartBefore(node)
    range.setEndAfter(node)
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
            if(child === null){
                continue
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
    let range = document.createRange()
    range.setStart(parentElement, 0)
    range.setEnd(parentElement, parentElement.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
}

module.exports = { createElement, render, Component }