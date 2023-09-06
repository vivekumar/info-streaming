import React from 'react'
import { Link } from 'react-router-dom'

const Startup = () => {
    return (
        <div className="mainWapper stream">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <div className="title">
                            <h3>Live Streaming</h3>
                        </div>
                    </div>
                </div>

                <div className="liveStream">
                    <div className="camera"></div>
                    <div className="content">
                        <h3>Lorem ipsum dolor sit amet consectetur.</h3>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit, corporis!</p>
                        <Link to="/" className='btn-custom'>Stream</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Startup