from psychopy.app import startApp, getAppFrame
from psychopy.localization import _translate


def on_new_button_clicked():
    print("new button clicked")


def main():
    startApp()
    builderFrame = getAppFrame("builder")
    builderFrame.toolbar.AddSeparator()
    builderFrame.toolbar.addPsychopyTool(
        name="compile_js",
        label=_translate("Test New Button"),
        shortcut="newButtonShortcut",
        tooltip="Test New Button Tooltip",
        func=on_new_button_clicked,
    )


if __name__ == "__main__":
    main()
