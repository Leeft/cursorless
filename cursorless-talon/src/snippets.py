from talon import Module, actions, app

from .csv_overrides import init_csv_and_watch_changes

mod = Module()
mod.list("cursorless_insert_snippet_action", desc="Cursorless insert snippet action")

# Deprecated tag; we should probably remove this and notify users that they
# should get rid of it, but I don't think it's worth the effort right now
mod.tag(
    "cursorless_experimental_snippets",
    desc="tag for enabling experimental snippet support",
)

mod.list("cursorless_wrapper_snippet", desc="Cursorless wrapper snippet")
mod.list(
    "cursorless_insertion_snippet_no_phrase",
    desc="Cursorless insertion snippets that don't accept a phrase",
)
mod.list(
    "cursorless_insertion_snippet_single_phrase",
    desc="Cursorless insertion snippet that can accept a single phrase",
)
mod.list("cursorless_phrase_terminator", "Contains term used to terminate a phrase")


@mod.capture(
    rule="{user.cursorless_insertion_snippet_no_phrase} | {user.cursorless_insertion_snippet_single_phrase}"
)
def cursorless_insertion_snippet(m) -> str:
    try:
        return m.cursorless_insertion_snippet_no_phrase
    except AttributeError:
        pass

    return m.cursorless_insertion_snippet_single_phrase.split(".")[0]


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
wrapper_snippets = {
    "else": "ifElseStatement.alternative",
    "funk": "functionDeclaration.body",
    "if else": "ifElseStatement.consequence",
    "if": "ifStatement.consequence",
    "try": "tryCatchStatement.body",
    "link": "link.text",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
insertion_snippets_no_phrase = {
    "if": "ifStatement",
    "if else": "ifElseStatement",
    "try": "tryCatchStatement",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
insertion_snippets_single_phrase = {
    "funk": "functionDeclaration.name",
    "link": "link.text",
}


@mod.action_class
class Actions:
    def cursorless_insert_snippet_with_phrase(
        action: str, snippet_description: str, text: str
    ):
        """Perform cursorless wrap action"""
        snippet_name, snippet_variable = snippet_description.split(".")
        actions.user.cursorless_implicit_target_command(
            action, snippet_name, {snippet_variable: text}
        )


def on_ready():
    init_csv_and_watch_changes(
        "experimental/wrapper_snippets",
        {
            "wrapper_snippet": wrapper_snippets,
        },
        allow_unknown_values=True,
        default_list_name="wrapper_snippet",
    )
    init_csv_and_watch_changes(
        "experimental/insertion_snippets",
        {
            "insertion_snippet_no_phrase": insertion_snippets_no_phrase,
        },
        allow_unknown_values=True,
        default_list_name="insertion_snippet_no_phrase",
    )
    init_csv_and_watch_changes(
        "experimental/insertion_snippets_single_phrase",
        {
            "insertion_snippet_single_phrase": insertion_snippets_single_phrase,
        },
        allow_unknown_values=True,
        default_list_name="insertion_snippet_single_phrase",
    )
    init_csv_and_watch_changes(
        "experimental/miscellaneous",
        {
            "phrase_terminator": {"over": "phraseTerminator"},
        },
    )


app.register("ready", on_ready)
