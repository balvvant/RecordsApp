import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';


const CustomColorPickerComponent = ({ pickerName, defaultColor, onColorChange }) => {
    const [ColorFlag, setColorFlag] = useState(false);
    const [ColorValue, setColorValue] = useState(defaultColor);

    useEffect(() => {
        setColorValue(defaultColor);
    }, [defaultColor]);

    const handleColorChange = (color) => {
        let value = color.hex;

        setColorValue(value);
        onColorChange(value);
    }

    return (
        <div className=" col-md-12 col-12  cmt-10 p-0"  >
            <div className="form-group" style={{ display: 'unset' }} >
                <div onClick={() => setColorFlag(!ColorFlag)}>

                    <TextField
                        label={pickerName}
                        placeholder="Select color"
                        className='mt-0 mb-0 d-flex'
                        margin="normal"
                        variant="outlined"
                        name="color_picker"
                        value={ColorValue}
                    // editable={false}
                    />
                </div>

                {
                    ColorFlag ?
                        <div style={{ position: 'absolute', zIndex: '2' }}>
                            <div style={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }} onClick={() => setColorFlag(false)} />

                            <SketchPicker
                                color={ColorValue}
                                onChange={(color) => handleColorChange(color)}
                            />
                        </div>
                        : null
                }
            </div>
        </div>

    )

}



export default CustomColorPickerComponent;