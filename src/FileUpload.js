import React from 'react';

class FileUpload extends React.Component {
    constructor(){
        super();
        this.state = {
            UploadValue : 0
        };
    }

    render () {
        return (
            <div>
                <progress value={this.state.uploadValue} max="100">
                    {this.state.uploadValue} %
                </progress>
                <br/>
                <input type='file' onChange= {this.props.onUpload}/>
                <br/>
                <img width='320' src={this.state.picture} alt=''/>
            </div>
        );
    }
}

export default FileUpload;