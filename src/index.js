
const { createElement, render, Component } = require('./toy-react')
class MyComponent extends Component{
    
    render(){
        return <div>
            <h1>my component</h1>
            {this.children}
        </div>
    }
}


const div = <MyComponent id="1">
    <div class="child"></div>
    <div class="child">
        <div class="child-child"></div>
    </div>
    <div class="child">Hello World</div>
</MyComponent>


render(div, document.body)