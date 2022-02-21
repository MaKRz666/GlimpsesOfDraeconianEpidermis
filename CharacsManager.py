import os, json
import pandas as pd
import matplotlib.pyplot as plt

# this finds our json files
path_to_json = r'C:/Users/GL/Documents/makrz/'
json_files = [pos_json for pos_json in os.listdir(path_to_json) if pos_json.endswith('.json')]

# here I define my pandas Dataframe with the columns I want to get from the json
jsons_data = pd.DataFrame(columns=['Palette', 'NbColors', 'PxSize', 'RepeatMode', 'Render', 'Pattern', 'DistoType', 'ColoredRatio', 'HueGradAmpl', 'ExtraDirectionalNoise', 'Mirrored', 'AnglesRounded', 'PaletteShuffled'])

# we need both the json and an index number so use enumerate()
for index, js in enumerate(json_files):
    with open(os.path.join(path_to_json, js)) as json_file:
        json_text = json.load(json_file)

        # here you need to know the layout of your json and each json has to have
        # the same structure (obviously not the structure I have here)
        palette = json_text['Macro']['data']['PaletteKey'] + str(json_text['Macro']['data']['PaletteIndex'])
        nbcolors = json_text['Macro']['data']['NbColorsActual']
        pxSize = json_text['Macro']['data']['PixelSize']
        rptMode = json_text['Macro']['data']['RepeatMode']
        render = json_text['Macro']['data']['RenderType']
        pattern = json_text['Macro']['data']['PatternType']
        distoType = json_text['Meso']['data']['DistorsionType']
        coloredRatio = json_text['Meso']['data']['ColoredPixelsRatio']
        hueGradAmpl = json_text['Meso']['data']['HueGradientAmplitude']
        xtraNoise = json_text['Meso']['data']['ExtraDirectionalNoise']
        mirrored = json_text['Meso']['data']['DistorsionIsMirrored']
        anglesRounded = json_text['Meso']['data']['DistorsionDoRounding']
        paletteShuffled = json_text['Meso']['data']['PaletteShuffleEnabled']
        # here I push a list of data into a pandas DataFrame at row given by 'index'
        jsons_data.loc[index] = [palette, nbcolors, pxSize, rptMode, render, pattern, distoType, coloredRatio, hueGradAmpl, xtraNoise, mirrored, anglesRounded, paletteShuffled]

# now that we have the pertinent json data in our DataFrame let's look at it
# print(jsons_data)

# plot an histogram on a given column
# col = 'PxSize'
# jsons_data[col].plot.hist(bins = 132, range = [12, 45])
col = 'DistoType'
plt.savefig(path_to_json + 'hist_' + col + '.png')

