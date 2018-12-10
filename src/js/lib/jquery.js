import Script from 'scriptjs'

export default new Promise((resolve, reject) => {
    Script('https://code.jquery.com/jquery-3.3.1.slim.min.js', () => {
        console.log('jQuery loaded')
        return resolve(window.jQuery)
    })
})
