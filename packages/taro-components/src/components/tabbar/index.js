import Taro from '@tarojs/taro-h5'
import Nerv from 'nervjs'
import classNames from 'classnames'
import './style'

const removeLeadingSlash = str => str.replace(/^\.?\//, '')
const removeTrailingSearch = str => str.replace(/\?[\s\S]*$/, '')

class Tabbar extends Nerv.Component {
  constructor (props) {
    super(...arguments)
    const list = props.conf.list
    if (
      Object.prototype.toString.call(list) !== '[object Array]' ||
      list.length < 2 ||
      list.length > 5
    ) {
      throw new Error('tabBar 配置错误')
    }

    this.homePage = removeLeadingSlash(props.homePage)

    this.state = {
      list,
      isShow: false,
      selectedIndex: 0
    }
  }
  componentDidMount () {
    this.bindEvent()
    this.hashChangeHandler()
  }

  componentUnMount () {
    this.removeEvent()
  }

  getCurrentPathname () {
    let pathname
    if (this.props.mode === 'hash') {
      pathname = location.hash.replace('#', '')
    } else {
      pathname = location.pathname.replace(new RegExp(`^${this.props.publicPath}/?`), '')
    }

    return removeTrailingSearch(pathname)
  }

  hashChangeHandler ({ toLocation } = {}) {
    let currentPage

    if (toLocation) {
      currentPage = toLocation.pathname ? removeLeadingSlash(toLocation.pathname) : this.homePage
    } else {
      currentPage = this.getCurrentPathname() || this.homePage
    }

    const stateObj = { isShow: false }
    const foundIdx = this.state.list.findIndex(v => {
      return v.pagePath.indexOf(currentPage) > -1
    })
    if (foundIdx > -1) {
      Object.assign(stateObj, {
        isShow: true,
        selectedIndex: foundIdx
      })
    }
    this.setState(stateObj)
  }

  hideBar () {
    this.setState({
      isShow: false
    })
  }

  showBar () {
    this.setState({
      isShow: true
    })
  }

  bindEvent () {
    const handler = this.hashChangeHandler.bind(this)
    Taro['eventCenter'].on('routerChange', handler)
    this.removeEvent = () => {
      Taro['eventCenter'].off('routerChange', handler)
    }
  }

  render () {
    const { conf, router = {} } = this.props
    function handleSelect (index, e) {
      let list = this.state.list
      router.redirectTo && router.redirectTo({
        url: (/^\//.test(list[index].pagePath) ? '' : '/') + list[index].pagePath
      })
    }
    conf.borderStyle = conf.borderStyle || 'black'
    let containerCls = classNames('weui-tabbar', {
      [`taro-tabbar__border-${conf.borderStyle}`]: true
    })
    return (
      <div className='taro-tabbar__tabbar' style={{display: this.state.isShow ? '' : 'none'}}>
        <div
          className={containerCls}
          style={{
            backgroundColor: conf.backgroundColor || ''
          }}
        >
          {this.state.list.map((item, index) => {
            const cls = classNames('weui-tabbar__item', {
              [`weui-bar__item_on`]: this.state.selectedIndex === index
            })
            let textStyle = {
              color: this.state.selectedIndex === index ? conf.selectedColor : conf.color || ''
            }
            return (
              <a
                key={index}
                href='javascript:;'
                className={cls}
                onClick={handleSelect.bind(this, index)}
              >
                <span style='display: inline-block;position: relative;'>
                  <img
                    src={this.state.selectedIndex === index ? item.selectedIconPath : item.iconPath}
                    alt=''
                    className='weui-tabbar__icon'
                  />
                </span>
                <p className='weui-tabbar__label' style={textStyle}>
                  {item.text}
                </p>
              </a>
            )
          })}
        </div>
      </div>
    )
  }
}

export default Tabbar
