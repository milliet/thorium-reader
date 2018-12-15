import * as React from "react";
import * as ReactDOM from "react-dom";

interface MenuContentProps {
    menuId: string;
    menuOpen: boolean;
    menuDir: string;
    menuStyle: object;
}

export default class MenuContent extends React.Component<MenuContentProps, undefined> {
    private appOverlayElement: HTMLElement;
    private rootElement: HTMLElement;

    public constructor(props: any) {
        super(props);

        this.appOverlayElement = document.getElementById("app-overlay");
        this.rootElement = document.createElement("div");
    }

    public componentDidMount() {
        this.appOverlayElement.appendChild(this.rootElement);
    }

    public componentWillUnmount() {
        this.appOverlayElement.removeChild(this.rootElement);
    }

    public render() {
        let menuClassName = null;

        return ReactDOM.createPortal(
            (
                <div
                    style={this.props.menuStyle}
                    id={this.props.menuId}
                    aria-hidden={!this.props.menuOpen}
                    className={menuClassName}
                >
                    {this.props.children}
                </div>
            ),
            this.rootElement,
        );
    }
}