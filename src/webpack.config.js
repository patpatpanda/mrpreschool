const path = require('path');

module.exports = {
    entry: './ClientApp/src/index.js',
    output: {
        path: path.resolve(__dirname, 'wwwroot/js'),
        filename: 'blog.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};
