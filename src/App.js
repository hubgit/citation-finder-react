import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Typography from '@material-ui/core/Typography'
import { ThemeProvider } from '@material-ui/styles'
import React, { useCallback, useEffect, useState } from 'react'
import FileSaver from 'file-saver'
import * as crossref from './crossref'
import { extensions, FORMAT_BIBTEX, FORMAT_RIS } from './formats'
import { Item } from './Item'
import { theme } from './theme'
import { Editor } from './Editor'
import { InputLabel } from '@material-ui/core'

export const App = () => {
  const [text, setText] = useState()
  const [items, setItems] = useState()
  const [format, setFormat] = useState(FORMAT_RIS)
  const [selectedItems, setSelectedItems] = useState()
  const [complete, setComplete] = useState(false)

  const splitItems = useCallback(() => {
    crossref.queue.clear() // TODO: cancel running request
    setItems(text.split(/\n+/).filter(_ => _.trim()))
  }, [text])

  useEffect(() => {
    // TODO: only clear those that changed?
    setSelectedItems(items ? Array(items.length) : undefined)
  }, [items])

  const addSelectedItem = useCallback((index, data) => {
    setSelectedItems((value = []) => {
      const items = [...value]
      items[index] = data
      return items
    })
  }, [])

  useEffect(() => {
    setComplete(
      items &&
        selectedItems &&
        selectedItems.filter(item => item !== undefined).length === items.length
    )
  }, [items, selectedItems])

  const downloadSelectedItems = useCallback(() => {
    const blob = new Blob(selectedItems, { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(blob, `citations.${extensions[format]}`)
  }, [format, selectedItems])

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={4} style={{ padding: 16 }}>
        <Grid item xs={12}>
          <Typography variant={'h2'}>1. Enter citations</Typography>

          <InputLabel shrink focused>Enter a list of citations, with each one on a new line</InputLabel>
          <Editor setText={setText}/>
        </Grid>

        {text && (
          <Grid item xs={12}>
            <Typography variant={'h2'}>2. Choose a citation format</Typography>

            <RadioGroup
              aria-label={'Citation format'}
              name={'format'}
              row={true}
              value={format}
              onChange={event => setFormat(event.target.value)}
            >
              <FormControlLabel
                value={FORMAT_RIS}
                control={<Radio color={'primary'} />}
                label={'RIS (EndNote, etc)'}
              />
              <FormControlLabel
                value={FORMAT_BIBTEX}
                control={<Radio color={'primary'} />}
                label={'BibTeX'}
              />
            </RadioGroup>
          </Grid>
        )}

        {text && format && (
          <Grid item xs={12}>
            <Typography variant={'h2'}>3. Search for matches</Typography>

            <Button
              variant={'contained'}
              color={'primary'}
              onClick={splitItems}
            >
              Search
            </Button>
          </Grid>
        )}

        {items && (
          <Grid item xs={12}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography variant={'h2'}>
                  4. Review the matched citations
                </Typography>

                <Typography variant={'body1'}>
                  Check each result below, select the correct match for each
                  item, then press "<b>Download All</b>" at the end of the page.
                </Typography>

                <Typography variant={'body1'}>
                  You can edit the citation text and search again, if a good
                  match wasn't found.
                </Typography>

                <Typography variant={'body1'}>
                  If no correct match can be found, leave the item with no
                  matches selected.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={4}>
                  {items.map((item, index) => (
                    <Grid item xs={12}>
                      <Item
                        key={index}
                        text={item}
                        format={format}
                        index={index}
                        addSelectedItem={addSelectedItem}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {selectedItems && (
          <Grid item xs={12}>
            <Typography variant={'h2'}>5. Download</Typography>

            <Grid
              container
              spacing={4}
              justify={'flex-start'}
              alignItems={'center'}
            >
              <Grid item>
                <Button
                  variant={'contained'}
                  color={'primary'}
                  disabled={!complete}
                  onClick={downloadSelectedItems}
                >
                  Download all selected citations
                </Button>
              </Grid>

              <Grid item>{!complete && <CircularProgress size={24} />}</Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </ThemeProvider>
  )
}
