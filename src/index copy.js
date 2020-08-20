
const { createElement, render, Component } = require('./toy-react')

class ComponentA extends Component{

    render(){
        console.log("ComponentA")
        return <div>{this.children}</div>
    }
}


class ComponentB extends Component{

    constructor(){
        super()
        this.state = {
            a: 1
        }
        this.onClick = this.onClick.bind(this)
    }

    onClick(){
        this.setState({
            a: this.state.a+1
        })
    }

    render(){
        return <div>{String(this.state.a)}<button onClick={this.onClick}>add</button></div>
    }
}
  

render(<ComponentA>
    <ComponentB />
</ComponentA>, document.getElementById("root"))