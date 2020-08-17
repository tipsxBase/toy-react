import { createElement, render, Component } from './toy-react'

class MyComponentA extends Component{

    render(){
        return <MyComponentB id="MyComponentA">
            {this.children}
        </MyComponentB>
    }
}

class MyComponentB extends Component{

    render(){
        return <div id="MyComponentB">
            Hello World
        </div>
    }
}





render(<MyComponentA />, document.getElementById("root"))