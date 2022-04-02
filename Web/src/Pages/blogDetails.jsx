import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class BlogDetails extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <section className="login-comp-wrapper">
                <div className="container">
                    <article class="content">
                        <h3 className='my-4'>Blog Post One</h3>
                        <img src='https://images.unsplash.com/photo-1466436578965-5cba086a1824?ixlib=rb-0.3.5&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&s=ac7f8b732c22f512fd982ffddc2078d6' alt='large-image' class="poster-image" />
                        <p className='blog-para'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore cum aperiam ex, recusandae non qui tempore. Quisquam, cupiditate! In suscipit tenetur sit beatae inventore aliquid fugit expedita quis totam. Pariatur?</p>
                        <p className='blog-para'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore cum aperiam ex, recusandae non qui tempore. Quisquam, cupiditate! In suscipit tenetur sit beatae inventore aliquid fugit expedita quis totam. Pariatur? Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore cum aperiam ex, recusandae non qui tempore. Quisquam, cupiditate! In suscipit tenetur sit beatae inventore aliquid fugit expedita quis totam. Pariatur? Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore cum aperiam ex, recusandae non qui tempore. Quisquam, cupiditate! In suscipit tenetur sit beatae inventore aliquid fugit expedita quis totam. Pariatur?</p>
                        <p className='blog-para'>Velit scelerisque in dictum non consectetur. Potenti nullam ac tortor vitae purus faucibus ornare suspendisse sed. Interdum velit euismod in pellentesque massa. Amet porttitor eget dolor morbi non. Pellentesque diam volutpat commodo sed egestas egestas. Massa sapien faucibus et molestie ac. Rhoncus aenean vel elit scelerisque mauris. In est ante in nibh mauris cursus mattis molestie a. At imperdiet dui accumsan sit amet nulla. Egestas erat imperdiet sed euismod nisi. In pellentesque massa placerat duis ultricies lacus sed turpis tincidunt. Maecenas volutpat blandit aliquam etiam. Orci phasellus egestas tellus rutrum tellus pellentesque. Id ornare arcu odio ut sem nulla pharetra diam sit. Faucibus pulvinar elementum integer enim. At risus viverra adipiscing at in tellus. Eget mauris pharetra et ultrices. Nulla posuere sollicitudin aliquam ultrices sagittis orci a.

                            Diam quam nulla porttitor massa id neque aliquam. Pharetra convallis posuere morbi leo urna molestie. Venenatis cras sed felis eget velit aliquet. In nulla posuere sollicitudin aliquam ultrices sagittis. Eget nulla facilisi etiam dignissim diam. Commodo sed egestas egestas fringilla phasellus. Etiam erat velit scelerisque in dictum non consectetur a erat. Pretium aenean pharetra magna ac. Mattis nunc sed blandit libero. Quam id leo in vitae turpis massa sed elementum. Sem viverra aliquet eget sit amet. Neque aliquam vestibulum morbi blandit cursus risus at ultrices mi. Felis donec et odio pellentesque diam. Convallis posuere morbi leo urna molestie at elementum eu. Tincidunt ornare massa eget egestas purus viverra. Id faucibus nisl tincidunt eget. Quisque id diam vel quam elementum pulvinar. Aliquam purus sit amet luctus venenatis lectus magna. Diam donec adipiscing tristique risus.</p>
                        <div className='bottom-blog'>
                            <div>
                                <p className='author-label'>Author</p>
                                <p className='author-name'>Lorem</p>
                            </div>
                            <div>
                                <p className='blog-created-label'>Created On</p>
                                <p className='blog-created-date'></p>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

        )
    }
}

export default withRouter(BlogDetails);