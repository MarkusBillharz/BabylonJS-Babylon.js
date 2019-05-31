import * as React from "react";

import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "./propertyChangedEvent";

class ListLineOption {
    public label: string;
    public value: number | string;
}

interface IOptionsLineComponentProps {
    label: string,
    target: any,
    propertyName: string,
    options: ListLineOption[],
    noDirectUpdate?: boolean,
    onSelect?: (value: number | string) => void,
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>,
    valuesAreStrings?: boolean
}

export class OptionsLineComponent extends React.Component<IOptionsLineComponentProps, { value: number | string }> {
    private _localChange = false;

    constructor(props: IOptionsLineComponentProps) {
        super(props);

        this.state = { value: props.target[props.propertyName] };
    }

    shouldComponentUpdate(nextProps: IOptionsLineComponentProps, nextState: { value: number }) {
        if (this._localChange) {
            this._localChange = false;
            return true;
        }

        const newValue = nextProps.target[nextProps.propertyName];
        if (newValue != null && newValue !== nextState.value) {
            nextState.value = newValue;
            return true;
        }
        return false;
    }

    raiseOnPropertyChanged(newValue: number | string, previousValue: number | string) {
        if (!this.props.onPropertyChangedObservable) {
            return;
        }

        this.props.onPropertyChangedObservable.notifyObservers({
            object: this.props.target,
            property: this.props.propertyName,
            value: newValue,
            initialValue: previousValue
        });
    }

    updateValue(valueString: string) {
        const value = this.props.valuesAreStrings ? valueString : parseInt(valueString);
        this._localChange = true;

        const store = this.state.value;
        if (!this.props.noDirectUpdate) {
            this.props.target[this.props.propertyName] = value;
        }
        this.setState({ value: value });

        this.raiseOnPropertyChanged(value, store);

        if (this.props.onSelect) {
            this.props.onSelect(value);
        }
    }

    render() {
        return (
            <div className="listLine">
                <div className="label">
                    {this.props.label}

                </div>
                <div className="options">
                    <select onChange={evt => this.updateValue(evt.target.value)} value={this.state.value}>
                        {
                            this.props.options.map(option => {
                                return (
                                    <option key={option.label} value={option.value}>{option.label}</option>
                                )
                            })
                        }
                    </select>
                </div>
            </div>
        );
    }
}