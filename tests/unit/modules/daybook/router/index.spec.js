import daybookRouter from '@/modules/daybook/router'
import axios from 'axios'

describe('Pruebas en el router module del Daybook',()=>{
    test('El router debe de tener esta configuracion', async()=>{
        expect( daybookRouter ).toMatchObject({
            name:'daybook',
            component: expect.any( Function ),
            children:[
                {
                    path: '',
                    name:'no-entry',
                    component: expect.any( Function ),
                },
                {
                    path: ':id',
                    name:'entry',
                    component: expect.any( Function ),
                    props:expect.any( Function ),
                },
            ]
        })
        
        /* expect ( (await daybookRouter.children[0].component()).default.name ).toBe('NoEntrySelected')    
        expect ( (await daybookRouter.children[1].component()).default.name ).toBe('EntryView')
 */ 
        const promisesRoutes =[]
        daybookRouter.children.forEach(child => promisesRoutes.push(child.component()))

        const routes = (await Promise.all( promisesRoutes )).map(r => r.default.name)
        expect ( routes ).toContain('EntryView')
        expect ( routes ).toContain('NoEntrySelected') 
    })
    test('Debe de retornar el id de la ruta', () =>{
        const route={
            params:{
                id:'ABC-123'
            }
        }
        /* expect (daybookRouter.children[1].props( route )).toEqual({id:'ABC-123'}) */
        const entryRoute = daybookRouter.children.find(route => route.name === 'entry')
        expect ( entryRoute.props (  route )).toEqual({id: 'ABC-123'})
    })
})