// Import external components refrence
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { cyan500 } from 'material-ui/styles/colors'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { Provider } from 'react-redux'
import store, { history } from 'store/configureStore'
import { ConnectedRouter } from 'react-router-redux'

import 'babel-core/register'
import 'babel-polyfill'

// - Import app components
import Master from 'components/master'
// import { App } from 'components/AWS'

// Set default data
// tslint:disable-next-line:no-empty
store.subscribe(() => { })

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = getMuiTheme({

})

// App css
import 'applicationStyles'
const supportsHistory = 'pushState' in window.history

// ReactDOM.render(
// 	<Provider store={store}>
// 		<ConnectedRouter history={history}>
// 			<MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
// 				<Master />
// 			</MuiThemeProvider>
// 		</ConnectedRouter>
// 	</Provider>,
// 	document.getElementById('app')
// )
const render = (Component: any) => {
	 ReactDOM.render(
		<AppContainer warnings={false}>
			<Provider store={store}>
				<ConnectedRouter history={history}>
					<MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
						<Component />
					</MuiThemeProvider>
				</ConnectedRouter>
			</Provider>

		</AppContainer>,
		document.getElementById('app')
	)
}

render(Master)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('components/master', () => { render(Master) })
}